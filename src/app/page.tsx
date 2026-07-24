import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Categories } from "@/components/home/Categories";
import { ReviewCarousel } from "@/components/home/ReviewCarousel";
import { Newsletter } from "@/components/home/Newsletter";
import { getFeaturedProducts } from "@/lib/queries/products";

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <>
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="fixed inset-0 z-1 bg-text-primary/70" />

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <FeaturedProducts products={products} />
          <Categories />
          <ReviewCarousel />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </>
  );
}