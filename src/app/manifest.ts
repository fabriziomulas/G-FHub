import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Argento 925 e Titanio per Donna`,
    short_name: SITE_NAME,
    description: "Anelli, collane e bracciali in argento 925 e titanio. Qualità vera a un prezzo onesto.",
    start_url: "/",
    display: "standalone",
    background_color: "#0C0A09",
    theme_color: "#0C0A09",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
