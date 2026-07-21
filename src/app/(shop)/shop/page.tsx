import { Suspense } from "react";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { Skeleton } from "@/components/ui/primitives/Skeleton";

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-2">
            Shop
          </h1>
          <p className="text-text-secondary mb-8">
            Esplora la nostra collezione
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
          <Skeleton shape="rectangular" height="300px" className="w-full" />
          <Skeleton shape="text" width="60%" />
          <Skeleton shape="text" width="30%" />
        </div>
      ))}
    </div>
  );
}

async function ShopContent() {
  const { shopifyFetch } = await import("@/lib/shopify");

  const data = await shopifyFetch<{
    products: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          handle: string;
          description: string;
          images: { edges: Array<{ node: { url: string; altText: string | null } }> };
          priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
          compareAtPriceRange: { minVariantPrice: { amount: string; currencyCode: string } };
        };
      }>;
    };
  }>(`
    query {
      products(first: 24) {
        edges {
          node {
            id
            title
            handle
            description
            images(first: 1) {
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
          }
        }
      }
    }
  `);

  const products = data.products.edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    image: node.images.edges[0]?.node.url || "/placeholder.png",
    price: parseFloat(node.priceRange.minVariantPrice.amount).toFixed(2),
    compareAtPrice:
      node.compareAtPriceRange.minVariantPrice.amount !== "0.00"
        ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount).toFixed(2)
        : undefined,
  }));

  return <ShopGrid products={products} />;
}