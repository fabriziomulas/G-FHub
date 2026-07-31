"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { Button } from "@/components/ui/primitives/Button";
import { useCart } from "@/stores/cart";
import { trackEvent } from "@/lib/analytics";
import { Link } from "@/i18n/navigation";

export default function CartPage() {
  const t = useTranslations("Cart");
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    trackEvent("begin_checkout", {
      value: totalPrice(),
      currency: "EUR",
      items: items.map((item) => ({ item_id: item.id, item_name: item.title, quantity: item.quantity })),
    });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image?.startsWith("http") ? item.image : undefined,
          })),
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error("Checkout fallito");
    } catch {
      toast.error(t("checkoutError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="pt-24 min-h-screen bg-text-primary">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link href="/shop" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors">
            <ArrowLeft size={16} /> {t("backToShop")}
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
            {t("title")} {items.length > 0 && `(${items.length})`}
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
              <ShoppingBag size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-6">{t("empty")}</p>
              <Link href="/shop">
                <Button variant="secondary">{t("exploreCollection")}</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, i) => (
                  <motion.div
                    key={item.variantId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl"
                  >
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white/5 shrink-0">
                      {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" sizes="96px" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{item.title}</h4>
                      {item.options && <p className="text-sm text-gray-400">{item.options}</p>}
                      <p className="text-white font-semibold mt-1">€{(item.price * item.quantity).toFixed(2)}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10">
                          <Minus size={14} />
                        </button>
                        <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10">
                          <Plus size={14} />
                        </button>
                        <button onClick={() => removeItem(item.variantId)} className="ml-auto text-gray-400 hover:text-red-400 p-1.5">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit">
                <h2 className="text-lg font-bold text-white mb-4">{t("summary")}</h2>
                <div className="flex justify-between text-gray-300 text-sm mb-2">
                  <span>{t("subtotal")}</span>
                  <span>€{totalPrice().toFixed(2)}</span>
                </div>
                <p className="text-gray-500 text-xs mb-4">{t("shippingNote")}</p>
                <div className="border-t border-white/10 pt-4 flex justify-between text-white font-bold mb-6">
                  <span>{t("total")}</span>
                  <span>€{totalPrice().toFixed(2)}</span>
                </div>
                <Button size="lg" className="w-full" loading={loading} onClick={handleCheckout}>
                  {t("checkout")}
                </Button>
                <div className="flex flex-col gap-1.5 mt-4 text-gray-500 text-xs">
                  <span className="flex items-center gap-1.5"><Truck size={13} /> {t("trustShipping")}</span>
                  <span className="flex items-center gap-1.5"><RotateCcw size={13} /> {t("trustReturns")}</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> {t("trustSecure")}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
