"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { getRecentlyViewedIds } from "@/lib/recentlyViewed";

interface Product {
  id: string;
  title: string;
  handle: string;
  image: string;
  price: string;
  compareAtPrice?: string;
}

export function RecentlyViewed() {
  const t = useTranslations("Home");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const ids = getRecentlyViewedIds();
    if (ids.length === 0) return;

    fetch(`/api/products/by-ids?ids=${ids.join(",")}`)
      .then((res) => res.json())
      .then((data: Product[]) => {
        if (!Array.isArray(data)) return;
        // l'API non garantisce l'ordine — lo ripristiniamo secondo l'ordine di visualizzazione più recente
        const byId = new Map(data.map((p) => [p.id, p]));
        setProducts(ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p)));
      })
      .catch(() => setProducts([]));
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-14 px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-accent-electric text-sm tracking-widest uppercase mb-3">
            {t("recentlyViewedEyebrow")}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            {t("recentlyViewedTitle")}
          </h2>
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
