import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Categories } from "@/components/home/Categories";
import { Storytelling } from "@/components/home/Storytelling";
import { ReviewCarousel } from "@/components/home/ReviewCarousel";
import { getFeaturedProducts } from "@/lib/queries/products";
import { buildLanguageAlternates, canonicalFor } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: "Meta" });

  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
    alternates: {
      canonical: canonicalFor(lang, "/"),
      languages: buildLanguageAlternates("/"),
    },
    openGraph: { title: t("homeTitle"), description: t("homeDescription"), url: canonicalFor(lang, "/") },
  };
}

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <>
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="fixed inset-0 z-1 bg-text-primary/70" />

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <RecentlyViewed />
          <FeaturedProducts products={products} />
          <Categories />
          <Storytelling />
          <ReviewCarousel />
        </main>
        <Footer />
      </div>
    </>
  );
}