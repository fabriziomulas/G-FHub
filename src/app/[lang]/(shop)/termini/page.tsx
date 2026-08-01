import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage, LegalSection, PlaceholderNote } from "@/components/legal/LegalPage";
import { Link } from "@/i18n/navigation";
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
    title: tLegal("terminiTitle"),
    description: tMeta("terminiDescription"),
    alternates: {
      canonical: canonicalFor(lang, "/termini"),
      languages: buildLanguageAlternates("/termini"),
    },
  };
}

export default async function TerminiPage() {
  const t = await getTranslations("Legal");
  const sections = t.raw("terminiSections") as { title: string; body: string }[];

  return (
    <LegalPage title={t("terminiTitle")} updatedAtLabel={t("updatedAtLabel")} updatedAt={t("updatedAt")}>
      <PlaceholderNote>{t("terminiPlaceholderNote")}</PlaceholderNote>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs space-y-1.5">
        <p><span className="text-gray-500">{t("companyNameLabel")}:</span> <span className="text-white">{t("companyName")}</span></p>
        <p><span className="text-gray-500">{t("companyVatLabel")}:</span> <span className="text-white">{t("companyVat")}</span></p>
        <p><span className="text-gray-500">{t("companyAddressLabel")}:</span> <span className="text-white">{t("companyAddress")}</span></p>
      </div>

      {sections.map((s, i) => (
        <LegalSection key={s.title} title={s.title}>
          {i === 0 ? (
            <p>{t("terminiSeller")}</p>
          ) : i === 3 ? (
            <p>
              {s.body.split(t("spedizioniTitle"))[0]}
              <Link href="/spedizioni" className="text-accent-electric hover:underline">{t("spedizioniTitle")}</Link>.
            </p>
          ) : i === 4 ? (
            <>
              <p>{s.body}</p>
              <PlaceholderNote>{t("recessoExclusionNote")}</PlaceholderNote>
            </>
          ) : (
            <p>{s.body}</p>
          )}
        </LegalSection>
      ))}
    </LegalPage>
  );
}
