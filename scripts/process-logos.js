/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node CLI script, not part of the app bundle */
const sharp = require("sharp");
const path = require("path");
const { cleanTransparency } = require("./clean-transparency");

const ROOT = path.join(__dirname, "..");
const LOGO_FULL_SRC = path.join(ROOT, "gfhub-logo-final.png");
const LOGO_ICON_SRC = path.join(ROOT, "logo finale - 3.png");
const LOGO_FULL_CLEAN = path.join(ROOT, "scripts", "_logo-full-clean.png");
const LOGO_ICON_CLEAN = path.join(ROOT, "scripts", "_logo-icon-clean.png");

function padBbox(bbox, imgWidth, imgHeight, pad) {
  const left = Math.max(0, bbox.left - pad);
  const top = Math.max(0, bbox.top - pad);
  const right = Math.min(imgWidth, bbox.left + bbox.width + pad);
  const bottom = Math.min(imgHeight, bbox.top + bbox.height + pad);
  return { left, top, width: right - left, height: bottom - top };
}

async function main() {
  // 0. Source PNGs have a fake checkerboard baked into opaque pixels instead of
  // a real alpha channel (design-tool preview export) — recover true transparency first.
  const fullBboxRaw = await cleanTransparency(LOGO_FULL_SRC, LOGO_FULL_CLEAN);
  const iconBboxRaw = await cleanTransparency(LOGO_ICON_SRC, LOGO_ICON_CLEAN);

  const fullBbox = padBbox(fullBboxRaw, 1024, 1024, 6);
  const iconBbox = padBbox(iconBboxRaw, 1024, 1024, 6);
  console.log("logo-full crop bbox:", fullBbox);
  console.log("logo-icon crop bbox:", iconBbox);

  // 2. public/brand/logo-full.png — icon+text, cropped to content, height ~240px @ retina for navbar/footer/email use
  await sharp(LOGO_FULL_CLEAN)
    .extract(fullBbox)
    .resize({ height: 240, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(path.join(ROOT, "public", "brand", "logo-full.png"));
  console.log("wrote public/brand/logo-full.png");

  // 3. src/app/icon.png — icon-only, cropped to content, padded into square transparent canvas, 256x256
  const iconBuf = await sharp(LOGO_ICON_CLEAN).extract(iconBbox).toBuffer();
  const targetCanvas = 256;
  const padding = Math.round(targetCanvas * 0.12); // slight padding so it's not edge-to-edge
  const innerSize = targetCanvas - padding * 2;
  // sharp silently mis-sizes the output when two .resize() calls are chained
  // in one pipeline without materializing in between — split via toBuffer().
  const iconInner = await sharp(iconBuf)
    .resize({ width: innerSize, height: innerSize, fit: "inside" })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();
  await sharp(iconInner)
    .resize(targetCanvas, targetCanvas, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(ROOT, "src", "app", "icon.png"));
  console.log("wrote src/app/icon.png");

  // 4. src/app/apple-icon.png — icon-only composited onto solid brand-dark bg, opaque, 180x180
  const appleCanvas = 180;
  const applePadding = Math.round(appleCanvas * 0.18);
  const appleInner = appleCanvas - applePadding * 2;
  const appleIconResized = await sharp(iconBuf)
    .resize({ width: appleInner, height: appleInner, fit: "inside" })
    .toBuffer();
  const appleIconResizedMeta = await sharp(appleIconResized).metadata();

  await sharp({
    create: {
      width: appleCanvas,
      height: appleCanvas,
      channels: 4,
      background: { r: 12, g: 10, b: 9, alpha: 1 }, // #0C0A09 brand dark
    },
  })
    .composite([
      {
        input: appleIconResized,
        left: Math.round((appleCanvas - (appleIconResizedMeta.width || appleInner)) / 2),
        top: Math.round((appleCanvas - (appleIconResizedMeta.height || appleInner)) / 2),
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(ROOT, "src", "app", "apple-icon.png"));
  console.log("wrote src/app/apple-icon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
