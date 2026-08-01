import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildLanguageAlternates, canonicalFor } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: "Meta" });

  return {
    title: t("resiTitle"),
    description: t("resiDescription"),
    alternates: {
      canonical: canonicalFor(lang, "/resi"),
      languages: buildLanguageAlternates("/resi"),
    },
  };
}

export default function ResiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
