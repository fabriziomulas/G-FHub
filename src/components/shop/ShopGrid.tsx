"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/shop/ProductCard";
import { LayoutGrid, List } from "lucide-react";

interface Product {
  id: string;
  title: string;
  handle: string;
  image: string;
  price: string;
  compareAtPrice?: string;
}

export function ShopGrid({ products }: { products: Product[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div>
      {/* View toggle */}
      <div className="flex justify-end mb-6 gap-2">
        <button
          onClick={() => setView("grid")}
          className={`p-2 rounded-lg transition-colors ${
            view === "grid"
              ? "bg-accent-electric text-white"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <LayoutGrid size={18} />
        </button>
        <button
          onClick={() => setView("list")}
          className={`p-2 rounded-lg transition-colors ${
            view === "list"
              ? "bg-accent-electric text-white"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <List size={18} />
        </button>
      </div>

      {/* Products */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }
        >
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}