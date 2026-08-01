import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Truck, Clock, MapPin, PackageCheck } from "lucide-react";
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
    title: tLegal("spedizioniTitle"),
    description: tMeta("spedizioniDescription"),
    alternates: {
      canonical: canonicalFor(lang, "/spedizioni"),
      languages: buildLanguageAlternates("/spedizioni"),
    },
  };
}

export default async function SpedizioniPage() {
  const t = await getTranslations("Legal");

  return (
    <LegalPage title={t("spedizioniTitle")} updatedAtLabel={t("updatedAtLabel")} updatedAt={t("updatedAt")}>
      <PlaceholderNote>{t("spedizioniPlaceholderNote")}</PlaceholderNote>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose">
        <div className="flex flex-col items-center text-center gap-2 bg-white/5 border border-white/10 rounded-xl p-4">
          <Clock size={18} className="text-accent-electric" />
          <span className="text-white text-sm font-medium">{t("spedProcessingTime")}</span>
          <span className="text-gray-500 text-xs">{t("spedProcessingLabel")}</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2 bg-white/5 border border-white/10 rounded-xl p-4">
          <Truck size={18} className="text-accent-electric" />
          <span className="text-white text-sm font-medium">{t("spedDeliveryTime")}</span>
          <span className="text-gray-500 text-xs">{t("spedDeliveryLabel")}</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2 bg-white/5 border border-white/10 rounded-xl p-4">
          <MapPin size={18} className="text-accent-electric" />
          <span className="text-white text-sm font-medium">{t("spedArea")}</span>
          <span className="text-gray-500 text-xs">{t("spedAreaLabel")}</span>
        </div>
      </div>

      <LegalSection title={t("spedAreaTitle")}>
        <p>{t("spedAreaText")}</p>
      </LegalSection>

      <LegalSection title={t("spedTimesTitle")}>
        <p>{t("spedTimesText")}</p>
      </LegalSection>

      <LegalSection title={t("spedCostsTitle")}>
        <p>{t("spedCostsText")}</p>
      </LegalSection>

      <LegalSection title={t("spedCarrierTitle")}>
        <p>{t("spedCarrierText")}</p>
      </LegalSection>

      <LegalSection title={t("spedPackagingTitle")}>
        <div className="flex items-start gap-3">
          <PackageCheck size={18} className="text-accent-electric shrink-0 mt-0.5" />
          <p>{t("spedPackagingText")}</p>
        </div>
      </LegalSection>

      <LegalSection title={t("spedIssuesTitle")}>
        <p>{t("spedIssuesText")}</p>
      </LegalSection>
    </LegalPage>
  );
}
