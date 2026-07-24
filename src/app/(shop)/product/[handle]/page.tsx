import { Suspense } from "react";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ReviewModal } from "@/components/product/ReviewModal";
import { Skeleton } from "@/components/ui/primitives/Skeleton";
import { getProductByHandle } from "@/lib/queries/products";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params;

  return (
    <>
      <Navbar />

      <main className="pt-24 min-h-screen bg-text-primary">
        <Suspense fallback={<ProductSkeleton />}>
          <ProductContent handle={handle} />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}

function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <Skeleton
        shape="rectangular"
        height="500px"
        className="w-full rounded-2xl"
      />

      <div className="space-y-4">
        <Skeleton shape="text" width="80%" height="36px" />
        <Skeleton shape="text" width="30%" height="24px" />
        <Skeleton shape="text" width="100%" height="80px" />
        <Skeleton shape="rectangular" height="48px" className="w-40" />
      </div>
    </div>
  );
}

async function ProductContent({ handle }: { handle: string }) {
  const product = await getProductByHandle(handle);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl text-white">
          Prodotto non trovato
        </h2>
      </div>
    );
  }

  const variants = product.variants.map(
    (v: {
      id: string;
      name: string;
      inStock: boolean;
      price: number | null;
      value: string;
    }) => ({
      id: v.id,
      title: v.name,
      availableForSale: v.inStock,
      price: {
        amount: (v.price ?? product.price).toString(),
      },
      selectedOptions: [
        {
          name: v.name,
          value: v.value,
        },
      ],
    })
  );

  const bgImage = product.images?.[0] || "";

  return (
    <div className="relative">
      {bgImage && (
        <div
          className="fixed inset-0 z-0 opacity-15 blur-md"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="bg-text-primary/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ProductGallery
              images={product.images}
              title={product.title}
            />

            <ProductInfo
              title={product.title}
              description={product.description}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              variants={variants}
            />
          </div>
        </div>

        <ReviewModal productId={product.id} />
      </div>
    </div>
  );
}