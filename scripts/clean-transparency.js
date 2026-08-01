/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node CLI script, not part of the app bundle */
// The uploaded logo PNGs have a "fake" checkerboard baked into opaque RGB pixels
// (exported from a design-tool preview instead of a real alpha channel). This
// script detects the checkerboard's two colors, flood-fills the background
// region starting from the image borders (so it never eats into internal
// logo pixels that happen to share a similar tone, e.g. silver highlights),
// and rewrites the alpha channel so the background becomes truly transparent.
const sharp = require("sharp");
const path = require("path");

async function cleanTransparency(inputPath, outputPath, tolerance = 20) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const at = (x, y) => (y * width + x) * channels;

  const colorA = [data[at(5, 5)], data[at(5, 5) + 1], data[at(5, 5) + 2]];
  let colorB = null;
  for (let x = 6; x < 120; x++) {
    const idx = at(x, 5);
    const c = [data[idx], data[idx + 1], data[idx + 2]];
    const diff = Math.max(Math.abs(c[0] - colorA[0]), Math.abs(c[1] - colorA[1]), Math.abs(c[2] - colorA[2]));
    if (diff > 40) {
      colorB = c;
      break;
    }
  }
  console.log(inputPath, "colorA:", colorA, "colorB:", colorB);

  const closeTo = (idx, color, tol) => {
    return (
      Math.abs(data[idx] - color[0]) <= tol &&
      Math.abs(data[idx + 1] - color[1]) <= tol &&
      Math.abs(data[idx + 2] - color[2]) <= tol
    );
  };

  const isBackground = (x, y) => {
    const idx = at(x, y);
    if (closeTo(idx, colorA, tolerance)) return true;
    if (colorB && closeTo(idx, colorB, tolerance)) return true;
    return false;
  };

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let qHead = 0;
  let qTail = 0;

  const tryPush = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const pos = y * width + x;
    if (visited[pos]) return;
    if (!isBackground(x, y)) return;
    visited[pos] = 1;
    queue[qTail++] = pos;
  };

  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (qHead < qTail) {
    const pos = queue[qHead++];
    const x = pos % width;
    const y = (pos / width) | 0;
    tryPush(x + 1, y);
    tryPush(x - 1, y);
    tryPush(x, y + 1);
    tryPush(x, y - 1);
  }

  console.log("background pixels (strict pass):", qTail, "/", width * height);

  // Sparse single-pixel compression noise near the border (not close enough
  // to either checker color to flood-fill away) would otherwise blow up the
  // bbox to the full canvas. Label connected components of the remaining
  // "content" pixels and discard tiny ones (<25px) as noise, not real artwork.
  const compId = new Int32Array(width * height).fill(-1);
  const compSize = [];
  const stack = new Int32Array(width * height);
  for (let start = 0; start < width * height; start++) {
    if (visited[start] || compId[start] !== -1) continue;
    let sp = 0;
    stack[sp++] = start;
    compId[start] = compSize.length;
    let size = 0;
    while (sp > 0) {
      const pos = stack[--sp];
      size++;
      const x = pos % width;
      const y = (pos / width) | 0;
      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ];
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const npos = ny * width + nx;
        if (visited[npos] || compId[npos] !== -1) continue;
        compId[npos] = compSize.length;
        stack[sp++] = npos;
      }
    }
    compSize.push(size);
  }
  // Real logo strokes/letters form components in the thousands of pixels;
  // stray shadow/compression artifacts top out in the low hundreds (verified
  // via scripts/debug-components.js), so this threshold cleanly separates them.
  const NOISE_THRESHOLD = 800;
  let reclassified = 0;
  for (let i = 0; i < width * height; i++) {
    if (!visited[i] && compId[i] !== -1 && compSize[compId[i]] < NOISE_THRESHOLD) {
      visited[i] = 1; // too small to be real artwork — treat as background
      reclassified++;
    }
  }
  console.log("noise pixels reclassified as background:", reclassified);

  // Enclosed pockets of checkerboard (e.g. inside a closed loop of the "C"
  // stroke) never touch the image border, so the border flood-fill can't
  // reach them even though they're still just background. If a surviving
  // large component is overwhelmingly made of checker-colored pixels, it's
  // one of these pockets, not real artwork — clear it too.
  const compPixels = compSize.map(() => 0);
  const compBgMatches = compSize.map(() => 0);
  for (let i = 0; i < width * height; i++) {
    const id = compId[i];
    if (id === -1) continue;
    if (visited[i]) continue; // already reclassified as noise above
    compPixels[id]++;
    const x = i % width;
    const y = (i / width) | 0;
    if (isBackground(x, y)) compBgMatches[id]++;
  }
  let pocketsCleared = 0;
  for (let i = 0; i < width * height; i++) {
    const id = compId[i];
    if (id === -1 || visited[i]) continue;
    if (compPixels[id] > 0 && compBgMatches[id] / compPixels[id] > 0.8) {
      visited[i] = 1;
      pocketsCleared++;
    }
  }
  console.log("enclosed checker-pocket pixels cleared:", pocketsCleared);

  // Build a raw 1-channel mask image (255 = keep opaque, 0 = background) then
  // feather it with a small blur so the cut edge isn't razor-jagged.
  const maskRaw = Buffer.alloc(width * height);
  for (let i = 0; i < width * height; i++) {
    maskRaw[i] = visited[i] ? 0 : 255;
  }
  // sharp silently promotes a 1-channel raw buffer to 3 channels (sRGB) after
  // .blur() unless forced back down — extractChannel(0) guarantees the output
  // stays single-channel so byte offsets line up 1:1 with pixel indices.
  const featheredMask = await sharp(maskRaw, { raw: { width, height, channels: 1 } })
    .blur(1.2)
    .extractChannel(0)
    .raw()
    .toBuffer();

  // Zero out RGB on background pixels too (not just alpha) so downstream
  // tools like sharp's trim(), which compare raw pixel bytes, see a uniform
  // (0,0,0,0) border instead of the leftover alternating checker RGB values.
  const outRaw = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const bg = visited[i];
    outRaw[i * 4] = bg ? 0 : data[i * 4];
    outRaw[i * 4 + 1] = bg ? 0 : data[i * 4 + 1];
    outRaw[i * 4 + 2] = bg ? 0 : data[i * 4 + 2];
    outRaw[i * 4 + 3] = featheredMask[i];
  }

  await sharp(outRaw, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
  console.log("wrote", outputPath);

  // sharp's own .trim() proved unreliable on this feathered alpha (it picked
  // wrong/tiny crop regions), so compute the true content bounding box
  // ourselves directly from the mask instead of trusting trim() downstream.
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!visited[y * width + x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const bbox = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
  console.log("content bbox:", bbox);
  return bbox;
}

module.exports = { cleanTransparency };

if (require.main === module) {
  const ROOT = path.join(__dirname, "..");
  (async () => {
    await cleanTransparency(
      path.join(ROOT, "logo finale - 3.png"),
      path.join(ROOT, "scripts", "out-icon-clean.png")
    );
    await cleanTransparency(
      path.join(ROOT, "gfhub-logo-final.png"),
      path.join(ROOT, "scripts", "out-full-clean.png")
    );
  })();
}
