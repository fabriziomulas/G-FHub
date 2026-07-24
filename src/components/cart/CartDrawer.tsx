"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/stores/cart";
import { Button } from "@/components/ui/primitives/Button";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0C0A09] border-l border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-white" />
                <h2 className="text-lg font-semibold text-white">
                  Carrello ({items.length})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "calc(100vh - 200px)" }}>
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag size={40} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Il carrello è vuoto</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.variantId} className="flex gap-3 bg-white/[0.03] border border-white/10 p-3 rounded-xl">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">
                        {item.title}
                      </h4>
                      {item.options && (
                        <p className="text-xs text-gray-400 mt-0.5">{item.options}</p>
                      )}
                      <p className="text-sm font-semibold text-white mt-1">
                        €{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm text-white w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="ml-auto p-1 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#0C0A09]">
                <div className="flex justify-between text-white mb-3">
                  <span className="font-medium">Totale</span>
                  <span className="font-bold">€{totalPrice().toFixed(2)}</span>
                </div>
                <Button size="lg" className="w-full" loading={loading} onClick={handleCheckout}>
                  Pagamento Sicuro
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}