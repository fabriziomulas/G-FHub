"use client";

import { useTranslations } from "next-intl";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { ProductCard } from "@/components/shop/ProductCard";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";

export default function WishlistPage() {
  const t = useTranslations("Wishlist");
  const { items, loading } = useWishlist();

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-24 min-h-screen bg-[#0C0A09] flex items-center justify-center">
          <p className="text-gray-400">{t("loading")}</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-[#0C0A09] px-6">
        <div className="max-w-7xl mx-auto py-12">
          <h1 className="text-3xl font-bold text-white mb-2">{t("title")}</h1>
          <p className="text-gray-400 mb-8">{t("count", { count: items.length })}</p>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <Heart size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">{t("empty")}</p>
              <p className="text-gray-500 text-sm mt-1">{t("emptyHint")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item, i) => (
                <ProductCard
                  key={item.product.id}
                  product={{
                    id: item.product.id,
                    title: item.product.title,
                    handle: item.product.handle,
                    image: item.product.images[0] || "/placeholder.png",
                    price: item.product.price.toFixed(2),
                  }}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
