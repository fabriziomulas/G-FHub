"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { ProductCard } from "@/components/shop/ProductCard";

interface WishlistItem {
  product: { id: string; title: string; handle: string; price: number; images: string[] };
}

export default function SharedWishlistPage() {
  const t = useTranslations("Wishlist");
  const params = useParams<{ token: string }>();
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/wishlist/public/${params.token}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => {
        setOwnerName(data.ownerName);
        setItems(data.items);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.token]);

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-[#0C0A09] px-6">
        <div className="max-w-7xl mx-auto py-12">
          {loading ? (
            <p className="text-gray-400">{t("loading")}</p>
          ) : notFound ? (
            <div className="text-center py-20">
              <Heart size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">{t("sharedNotFound")}</p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-white mb-2">
                {ownerName ? t("sharedTitleName", { name: ownerName }) : t("sharedTitle")}
              </h1>
              <p className="text-gray-400 mb-8">{t("count", { count: items.length })}</p>

              {items.length === 0 ? (
                <div className="text-center py-20">
                  <Heart size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">{t("empty")}</p>
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
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
