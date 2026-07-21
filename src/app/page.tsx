import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Categories } from "@/components/home/Categories";
import { Storytelling } from "@/components/home/Storytelling";
import { Newsletter } from "@/components/home/Newsletter";
import { shopifyFetch } from "@/lib/shopify";
import { FEATURED_PRODUCTS_QUERY } from "@/lib/queries/products";

async function getProducts() {
  try {
    const data = await shopifyFetch<{
      products: { edges: Array<{ node: { id: string; title: string; handle: string; images: { edges: Array<{ node: { url: string; altText: string | null } }> }; priceRange: { minVariantPrice: { amount: string; currencyCode: string } }; compareAtPriceRange: { minVariantPrice: { amount: string; currencyCode: string } } } }> };
    }>(FEATURED_PRODUCTS_QUERY);

    return data.products.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      image: node.images.edges[0]?.node.url || "/placeholder.png",
      price: parseFloat(node.priceRange.minVariantPrice.amount).toFixed(2),
      compareAtPrice: node.compareAtPriceRange.minVariantPrice.amount !== "0.00"
        ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount).toFixed(2)
        : undefined,
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedProducts products={products} />
        <Categories />
        <Storytelling />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}