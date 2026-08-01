import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { Skeleton } from "@/components/ui/primitives/Skeleton";
import { getFilteredProducts, type ProductSort } from "@/lib/queries/products";
import { buildLanguageAlternates, canonicalFor } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: "Meta" });

  return {
    title: t("shopTitle"),
    description: t("shopDescription"),
    alternates: {
      canonical: canonicalFor(lang, "/shop"),
      languages: buildLanguageAlternates("/shop"),
    },
    openGraph: { title: t("shopTitle"), description: t("shopDescription"), url: canonicalFor(lang, "/shop") },
  };
}

interface ShopPageProps {
  searchParams: Promise<{ category?: string; min?: string; max?: string; sort?: string; q?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const t = await getTranslations("Shop");
  const params = await searchParams;

  return (
    <>
      <Navbar />

      <main className="pt-24 min-h-screen bg-text-primary">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {t("shopTitle")}
          </h1>

          <p className="text-gray-400 mb-8">
            {t("shopSubtitle")}
          </p>

          <Suspense fallback={null}>
            <ShopFilters />
          </Suspense>

          <Suspense fallback={<ShopSkeleton />} key={JSON.stringify(params)}>
            <ShopContent
              category={params.category}
              minPrice={params.min ? Number(params.min) : undefined}
              maxPrice={params.max ? Number(params.max) : undefined}
              sort={params.sort as ProductSort | undefined}
              q={params.q}
            />
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
          <Skeleton
            shape="rectangular"
            height="300px"
            className="w-full"
          />

          <Skeleton shape="text" width="60%" />
          <Skeleton shape="text" width="30%" />
        </div>
      ))}
    </div>
  );
}

async function ShopContent({
  category,
  minPrice,
  maxPrice,
  sort,
  q,
}: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  q?: string;
}) {
  const products = await getFilteredProducts({ category, minPrice, maxPrice, sort, q });

  return <ShopGrid products={products} />;
}
