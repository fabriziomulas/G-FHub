import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckCircle2, XCircle } from "lucide-react";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { buildLanguageAlternates, canonicalFor } from "@/lib/seo";

interface SummaryRow {
  aspect: string;
  silver: string;
  titanium: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: "CareGuide" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: canonicalFor(lang, "/cura-gioielli"),
      languages: buildLanguageAlternates("/cura-gioielli"),
    },
  };
}

export default async function CareGuidePage() {
  const t = await getTranslations("CareGuide");
  const silverTips = t.raw("silverTips") as string[];
  const titaniumTips = t.raw("titaniumTips") as string[];
  const avoidTips = t.raw("avoidTips") as string[];
  const summaryRows = t.raw("summaryRows") as SummaryRow[];

  return (
    <LegalPage title={t("title")}>
      <p className="text-gray-300">{t("intro")}</p>

      <LegalSection title={t("whyTitle")}>
        <p>{t("whyText")}</p>
      </LegalSection>

      <LegalSection title={t("silverTitle")}>
        <ul className="space-y-2.5">
          {silverTips.map((tip) => (
            <li key={tip} className="flex gap-2.5">
              <CheckCircle2 size={16} className="text-accent-electric shrink-0 mt-0.5" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title={t("titaniumTitle")}>
        <ul className="space-y-2.5">
          {titaniumTips.map((tip) => (
            <li key={tip} className="flex gap-2.5">
              <CheckCircle2 size={16} className="text-accent-electric shrink-0 mt-0.5" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title={t("avoidTitle")}>
        <ul className="space-y-2.5">
          {avoidTips.map((tip) => (
            <li key={tip} className="flex gap-2.5">
              <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title={t("summaryTitle")}>
        <div className="overflow-x-auto not-prose">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wide">
                <th className="text-left py-2 pr-4"></th>
                <th className="text-left py-2 pr-4">{t("summarySilver")}</th>
                <th className="text-left py-2">{t("summaryTitanium")}</th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((row) => (
                <tr key={row.aspect} className="border-b border-white/5">
                  <td className="py-2.5 pr-4 text-white font-medium whitespace-nowrap">{row.aspect}</td>
                  <td className="py-2.5 pr-4 text-gray-300">{row.silver}</td>
                  <td className="py-2.5 text-gray-300">{row.titanium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>
    </LegalPage>
  );
}
