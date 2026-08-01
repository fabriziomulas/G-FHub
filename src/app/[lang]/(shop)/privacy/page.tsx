import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage, LegalSection, PlaceholderNote } from "@/components/legal/LegalPage";
import { buildLanguageAlternates, canonicalFor } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const [tLegal, tMeta] = await Promise.all([
    getTranslations({ locale: lang, namespace: "Legal" }),
    getTranslations({ locale: lang, namespace: "Meta" }),
  ]);

  return {
    title: tLegal("privacyTitle"),
    description: tMeta("privacyDescription"),
    alternates: {
      canonical: canonicalFor(lang, "/privacy"),
      languages: buildLanguageAlternates("/privacy"),
    },
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("Legal");
  const sections = t.raw("privacySections") as { title: string; body: string }[];

  return (
    <LegalPage title={t("privacyTitle")} updatedAtLabel={t("updatedAtLabel")} updatedAt={t("updatedAt")}>
      <PlaceholderNote>{t("privacyPlaceholderNote")}</PlaceholderNote>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs space-y-1.5">
        <p><span className="text-gray-500">{t("companyNameLabel")}:</span> <span className="text-white">{t("companyName")}</span></p>
        <p><span className="text-gray-500">{t("companyVatLabel")}:</span> <span className="text-white">{t("companyVat")}</span></p>
        <p><span className="text-gray-500">{t("companyAddressLabel")}:</span> <span className="text-white">{t("companyAddress")}</span></p>
      </div>

      {sections.map((s) => (
        <LegalSection key={s.title} title={s.title}>
          <p>{s.body}</p>
        </LegalSection>
      ))}
    </LegalPage>
  );
}
