"use client";

import { motion } from "framer-motion";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/primitives/Button";
import { ArrowRight } from "lucide-react";

// Dati mock - poi collegheremo Shopify
const mockProducts = [
  {
    id: "1",
    title: "Minimal Watch Series X",
    handle: "minimal-watch-x",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    price: "299.00",
    compareAtPrice: "399.00",
    badge: "Nuovo",
    badgeColor: "electric" as const,
  },
  {
    id: "2",
    title: "Wireless Earbuds Pro",
    handle: "wireless-earbuds-pro",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    price: "179.00",
    badge: "Best Seller",
    badgeColor: "purple" as const,
  },
  {
    id: "3",
    title: "Leather Weekend Bag",
    handle: "leather-weekend-bag",
    image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&q=80",
    price: "449.00",
    compareAtPrice: "549.00",
    badge: "-20%",
    badgeColor: "success" as const,
  },
  {
    id: "4",
    title: "Ceramic Coffee Set",
    handle: "ceramic-coffee-set",
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&q=80",
    price: "89.00",
  },
];

export function FeaturedProducts() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <p className="text-text-muted text-sm tracking-widest uppercase mb-3">
              Novità
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary">
              Prodotti in evidenza
            </h2>
          </div>
          <Button variant="link" rightIcon={<ArrowRight size={16} />}>
            Vedi tutti
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}