import { Suspense } from "react";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { Skeleton } from "@/components/ui/primitives/Skeleton";
import { shopifyFetch } from "@/lib/shopify";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params;

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen">
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
  const data = await shopifyFetch<{
    productByHandle: {
      id: string;
      title: string;
      handle: string;
      description: string;
      images: { edges: Array<{ node: { url: string; altText: string | null } }> };
      priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
      compareAtPriceRange: { minVariantPrice: { amount: string; currencyCode: string } };
      variants: {
        edges: Array<{
          node: {
            id: string;
            title: string;
            availableForSale: boolean;
            price: { amount: string };
            selectedOptions: Array<{ name: string; value: string }>;
          };
        }>;
      };
    };
  }>(`
    query Product($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        handle
        description
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              availableForSale
              price {
                amount
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  `, { handle });

  const product = data.productByHandle;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl text-text-primary">Prodotto non trovato</h2>
      </div>
    );
  }

  const images = product.images.edges.map(({ node }) => node.url);
  const variants = product.variants.edges.map(({ node }) => node);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <ProductGallery images={images} title={product.title} />
      <ProductInfo
        title={product.title}
        description={product.description}
        price={product.priceRange.minVariantPrice.amount}
        compareAtPrice={product.compareAtPriceRange.minVariantPrice.amount}
        variants={variants}
      />
    </div>
  );
}