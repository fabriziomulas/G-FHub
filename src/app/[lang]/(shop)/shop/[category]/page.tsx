import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { Skeleton } from "@/components/ui/primitives/Skeleton";
import { getProductsByCategory } from "@/lib/queries/products";
import { buildLanguageAlternates, canonicalFor } from "@/lib/seo";

const CATEGORY_KEYS: Record<string, "categoryRingsTitle" | "categoryNecklacesTitle" | "categoryBraceletsTitle"> = {
  anelli: "categoryRingsTitle",
  collane: "categoryNecklacesTitle",
  bracciali: "categoryBraceletsTitle",
};

interface PageProps {
  params: Promise<{ category: string; lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, lang } = await params;
  const labelKey = CATEGORY_KEYS[category];
  if (!labelKey) return {};

  const [tShop, tMeta] = await Promise.all([
    getTranslations({ locale: lang, namespace: "Shop" }),
    getTranslations({ locale: lang, namespace: "Meta" }),
  ]);
  const label = tShop(labelKey);
  const description = tMeta("categoryDescription", { category: label });
  const path = `/shop/${category}`;

  return {
    title: label,
    description,
    alternates: {
      canonical: canonicalFor(lang, path),
      languages: buildLanguageAlternates(path),
    },
    openGraph: { title: label, description, url: canonicalFor(lang, path) },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const labelKey = CATEGORY_KEYS[category];

  if (!labelKey) {
    notFound();
  }

  const t = await getTranslations("Shop");
  const label = t(labelKey);

  return (
    <>
      <Navbar />

      <main className="pt-24 min-h-screen bg-text-primary">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{label}</h1>
          <p className="text-gray-400 mb-8">{t("categorySubtitle", { category: label.toLowerCase() })}</p>

          <Suspense fallback={<ShopSkeleton />}>
            <CategoryContent category={category} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </>
  );
}

function ShopSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton shape="rectangular" height="300px" className="w-full" />
          <Skeleton shape="text" width="60%" />
          <Skeleton shape="text" width="30%" />
        </div>
      ))}
    </div>
  );
}

async function CategoryContent({ category }: { category: string }) {
  const products = await getProductsByCategory(category);

  return <ShopGrid products={products} />;
}
