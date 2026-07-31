import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { Skeleton } from "@/components/ui/primitives/Skeleton";
import { getProductsByCategory } from "@/lib/queries/products";

const CATEGORY_LABELS: Record<string, string> = {
  anelli: "Anelli",
  collane: "Collane",
  bracciali: "Bracciali",
};

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const label = CATEGORY_LABELS[category];

  if (!label) {
    notFound();
  }

  return (
    <>
      <Navbar />

      <main className="pt-24 min-h-screen bg-text-primary">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{label}</h1>
          <p className="text-gray-400 mb-8">Esplora la nostra collezione di {label.toLowerCase()}</p>

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
