import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { Skeleton } from "@/components/ui/primitives/Skeleton";
import { prisma } from "@/lib/prisma";

export default async function NewArrivalsPage() {
  const t = await getTranslations("Shop");

  return (
    <>
      <Navbar />

      <main className="pt-24 min-h-screen bg-text-primary">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {t("newTitle")}
          </h1>

          <p className="text-gray-400 mb-8">
            {t("newSubtitle")}
          </p>

          <Suspense fallback={<ShopSkeleton />}>
            <ShopContent />
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

async function ShopContent() {
  const products = await prisma.product.findMany({
    where: {
      inStock: true,
      isNew: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const mapped = products.map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    image: p.images[0] || "/placeholder.png",
    price: p.price.toFixed(2),
    compareAtPrice: p.compareAtPrice
      ? p.compareAtPrice.toFixed(2)
      : undefined,
  }));

  return <ShopGrid products={mapped} />;
}
