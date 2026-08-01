import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";
import { buildLanguageAlternates, canonicalFor } from "@/lib/seo";

const STATIC_PATHS = [
  "/",
  "/shop",
  "/shop/new",
  "/shop/best-seller",
  "/shop/offerte",
  "/shop/anelli",
  "/shop/collane",
  "/shop/bracciali",
  "/chi-siamo",
  "/privacy",
  "/termini",
  "/spedizioni",
  "/resi",
  "/guida-taglie",
  "/cura-gioielli",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { inStock: true },
    select: { handle: true, updatedAt: true },
  });

  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const locale of routing.locales) {
      entries.push({
        url: canonicalFor(locale, path),
        lastModified: new Date(),
        alternates: { languages: buildLanguageAlternates(path) },
      });
    }
  }

  for (const product of products) {
    const path = `/product/${product.handle}`;
    for (const locale of routing.locales) {
      entries.push({
        url: canonicalFor(locale, path),
        lastModified: product.updatedAt,
        alternates: { languages: buildLanguageAlternates(path) },
      });
    }
  }

  return entries;
}
