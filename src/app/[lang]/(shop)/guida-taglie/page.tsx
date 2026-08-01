import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { buildLanguageAlternates, canonicalFor } from "@/lib/seo";

interface RingRow {
  size: string;
  mm: string;
}
interface NecklaceRow {
  cm: string;
  label: string;
}
interface BraceletRow {
  size: string;
  range: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: "SizeGuide" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: canonicalFor(lang, "/guida-taglie"),
      languages: buildLanguageAlternates("/guida-taglie"),
    },
  };
}

export default async function SizeGuidePage() {
  const t = await getTranslations("SizeGuide");
  const ringsTable = t.raw("ringsTable") as RingRow[];
  const necklaceLengths = t.raw("necklaceLengths") as NecklaceRow[];
  const braceletsTable = t.raw("braceletsTable") as BraceletRow[];

  return (
    <LegalPage title={t("title")}>
      <p className="text-gray-300">{t("intro")}</p>

      <LegalSection title={t("ringsTitle")}>
        <p className="font-medium text-white">{t("ringsMethodsTitle")}</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>{t("ringsMethod1")}</li>
          <li>{t("ringsMethod2")}</li>
        </ul>
        <p className="text-accent-electric text-xs">{t("ringsTip")}</p>

        <div className="overflow-x-auto not-prose mt-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wide">
                <th className="text-left py-2 pr-4">{t("ringsTableSize")}</th>
                <th className="text-left py-2">{t("ringsTableDiameter")}</th>
              </tr>
            </thead>
            <tbody>
              {ringsTable.map((row) => (
                <tr key={row.size} className="border-b border-white/5">
                  <td className="py-2 pr-4 text-white">{row.size}</td>
                  <td className="py-2 text-gray-300">{row.mm} mm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title={t("necklacesTitle")}>
        <p>{t("necklacesIntro")}</p>
        <ul className="space-y-2">
          {necklaceLengths.map((row) => (
            <li key={row.cm} className="flex gap-3">
              <span className="text-white font-medium shrink-0 w-14">{row.cm} cm</span>
              <span className="text-gray-300">{row.label}</span>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title={t("braceletsTitle")}>
        <p>{t("braceletsIntro")}</p>
        <div className="overflow-x-auto not-prose mt-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wide">
                <th className="text-left py-2 pr-4">{t("braceletsTableSize")}</th>
                <th className="text-left py-2">{t("braceletsTableWrist")}</th>
              </tr>
            </thead>
            <tbody>
              {braceletsTable.map((row) => (
                <tr key={row.size} className="border-b border-white/5">
                  <td className="py-2 pr-4 text-white">{row.size}</td>
                  <td className="py-2 text-gray-300">{row.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>
    </LegalPage>
  );
}
