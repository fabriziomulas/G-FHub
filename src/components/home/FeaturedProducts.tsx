"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/primitives/Button";
import { ArrowRight } from "lucide-react";

interface Product {
  id: string;
  title: string;
  handle: string;
  image: string;
  price: string;
  compareAtPrice?: string;
}

export function FeaturedProducts({ products }: { products: Product[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="py-24 px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
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
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}