import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Categories } from "@/components/home/Categories";
import { Storytelling } from "@/components/home/Storytelling";
import { Newsletter } from "@/components/home/Newsletter";
import { getFeaturedProducts } from "@/lib/queries/products";

export default async function Home() {
  const products = await getFeaturedProducts();

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