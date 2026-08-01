import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { Button } from "@/components/ui/primitives/Button";
import { Gem, Sparkles, ShieldCheck, Truck, ArrowRight, User, ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buildLanguageAlternates, canonicalFor } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: "Meta" });

  return {
    title: t("chiSiamoTitle"),
    description: t("chiSiamoDescription"),
    alternates: {
      canonical: canonicalFor(lang, "/chi-siamo"),
      languages: buildLanguageAlternates("/chi-siamo"),
    },
    openGraph: { title: t("chiSiamoTitle"), description: t("chiSiamoDescription"), url: canonicalFor(lang, "/chi-siamo") },
  };
}

export default async function ChiSiamoPage() {
  const t = await getTranslations("ChiSiamo");

  return (
    <>
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1775652138507-17280f2a59a4?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="fixed inset-0 z-1 bg-text-primary/80" />

      <div className="relative z-10">
        <Navbar />
        <main className="pt-24 min-h-screen">
          {/* Hero */}
          <section className="py-24 px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <p className="text-accent-electric text-sm tracking-widest uppercase mb-4">
                {t("sinceBadge")}
              </p>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {t("heroTitle1")}
                <br />
                {t("heroTitle2")}
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed">
                {t("heroText")}
              </p>
            </div>
          </section>

          {/* Storia / Missione */}
          <section className="py-16 px-6">
            <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-14 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-5">
                  {t("whyTitle")}
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t("whyText1")}
                </p>
                <p className="text-gray-300 leading-relaxed">
                  {t("whyText2")}
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-6xl font-bold text-accent-electric mb-2">925</p>
                <p className="text-gray-400 text-sm tracking-wide uppercase">{t("foundedLabel")}</p>
              </div>
            </div>
          </section>

          {/* Valori */}
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <p className="text-accent-electric text-sm tracking-widest uppercase mb-3">
                  {t("valuesEyebrow")}
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  {t("valuesTitle")}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                  <div className="w-12 h-12 rounded-xl bg-accent-electric/10 flex items-center justify-center mb-5">
                    <Gem size={22} className="text-accent-electric" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t("value1Title")}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {t("value1Text")}
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                  <div className="w-12 h-12 rounded-xl bg-accent-electric/10 flex items-center justify-center mb-5">
                    <Sparkles size={22} className="text-accent-electric" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t("value2Title")}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {t("value2Text")}
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                  <div className="w-12 h-12 rounded-xl bg-accent-electric/10 flex items-center justify-center mb-5">
                    <ShieldCheck size={22} className="text-accent-electric" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t("value3Title")}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {t("value3Text")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Impegno / Spedizioni */}
          <section className="py-16 px-6">
            <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 rounded-2xl bg-accent-electric/10 flex items-center justify-center shrink-0">
                <Truck size={28} className="text-accent-electric" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {t("commitmentTitle")}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {t("commitmentText")}
                </p>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <p className="text-accent-electric text-sm tracking-widest uppercase mb-3">
                  {t("teamEyebrow")}
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  {t("teamTitle")}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <User size={32} className="text-gray-500" />
                    </div>
                    <h3 className="text-white font-semibold mb-1">{t("teamMemberName")}</h3>
                    <p className="text-accent-electric text-xs uppercase tracking-wide mb-3">{t("teamMemberRole")}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {t("teamMemberText")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-14">
                <p className="text-accent-electric text-sm tracking-widest uppercase mb-3">
                  {t("faqEyebrow")}
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  {t("faqTitle")}
                </h2>
              </div>

              <div className="space-y-3">
                <details className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <summary className="flex items-center justify-between cursor-pointer text-white font-medium list-none">
                    {t("faq1Q")}
                    <ChevronDown size={18} className="text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="text-gray-400 text-sm leading-relaxed mt-4">
                    {t("faq1A")}
                  </p>
                </details>

                <details className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <summary className="flex items-center justify-between cursor-pointer text-white font-medium list-none">
                    {t("faq2Q")}
                    <ChevronDown size={18} className="text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="text-gray-400 text-sm leading-relaxed mt-4">
                    {t("faq2A")}
                  </p>
                </details>

                <details className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <summary className="flex items-center justify-between cursor-pointer text-white font-medium list-none">
                    {t("faq3Q")}
                    <ChevronDown size={18} className="text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="text-gray-400 text-sm leading-relaxed mt-4">
                    {t("faq3A")}
                  </p>
                </details>

                <details className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <summary className="flex items-center justify-between cursor-pointer text-white font-medium list-none">
                    {t("faq4Q")}
                    <ChevronDown size={18} className="text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="text-gray-400 text-sm leading-relaxed mt-4">
                    {t("faq4A")}
                  </p>
                </details>
              </div>
            </div>
          </section>

          {/* CTA finale */}
          <section className="py-20 px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {t("ctaTitle")}
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {t("ctaText")}
            </p>
            <Link href="/shop">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                {t("ctaButton")}
              </Button>
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
