import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ReviewModal } from "@/components/product/ReviewModal";
import { ProductReviews } from "@/components/product/ProductReviews";
import { Skeleton } from "@/components/ui/primitives/Skeleton";
import { getProductByHandle } from "@/lib/queries/products";
import { buildLanguageAlternates, canonicalFor } from "@/lib/seo";

interface PageProps {
  params: Promise<{ handle: string; lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle, lang } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return {};

  const path = `/product/${handle}`;
  const description = product.description
    ? product.description.slice(0, 160)
    : product.title;

  return {
    title: product.title,
    description,
    alternates: {
      canonical: canonicalFor(lang, path),
      languages: buildLanguageAlternates(path),
    },
    openGraph: {
      title: product.title,
      description,
      url: canonicalFor(lang, path),
      images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { handle, lang } = await params;
  const product = await getProductByHandle(handle);

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-text-primary">
        {product && <ProductJsonLd product={product} lang={lang} />}
        <Suspense fallback={<ProductSkeleton />}>
          <ProductContent handle={handle} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

function ProductJsonLd({
  product,
  lang,
}: {
  product: NonNullable<Awaited<ReturnType<typeof getProductByHandle>>>;
  lang: string;
}) {
  const url = canonicalFor(lang, `/product/${product.handle}`);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || product.title,
    image: product.images,
    sku: product.id,
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(product.reviewCount > 0 && product.averageRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.averageRating.toFixed(1),
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: canonicalFor(lang, "/shop") },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: product.category,
              item: canonicalFor(lang, `/shop/${product.category}`),
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: product.category ? 3 : 2,
        name: product.title,
        item: url,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </>
  );
}

function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <Skeleton shape="rectangular" height="500px" className="w-full rounded-2xl" />
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
    const t = await getTranslations("Product");
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl text-white">{t("notFound")}</h2>
      </div>
    );
  }

  const variants = product.variants.map(
    (v: { id: string; name: string; inStock: boolean; price: number | null; value: string }) => ({
      id: v.id,
      title: v.name,
      availableForSale: v.inStock,
      price: { amount: (v.price ?? product.price).toString() },
      selectedOptions: [{ name: v.name, value: v.value }],
    })
  );

  const bgImage = product.images?.[0] || "";

  return (
    <div className="relative">
      {bgImage && (
        <div
          className="fixed inset-0 z-0 opacity-15 blur-md"
          style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="bg-text-primary/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ProductGallery images={product.images} title={product.title} />
            <ProductInfo
              title={product.title}
              description={product.description}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              variants={variants}
              productId={product.id}
              inStock={product.inStock}
              stock={product.stock}
            />
          </div>
          <ProductReviews productId={product.id} />
        </div>
        <ReviewModal productId={product.id} />
      </div>
    </div>
  );
}