"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  name: string;
  text: string;
  stars: number;
  product: { title: string; handle: string };
}

export function ReviewCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return null;
  }

  if (reviews.length === 0) {
    return (
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-accent-electric text-sm tracking-widest uppercase mb-3">
            Cosa dicono di noi
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Recensioni
          </h2>
          <div className="bg-white/0.03 backdrop-blur-md border border-white/10 rounded-3xl p-12 max-w-lg mx-auto">
            <MessageSquare size={40} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nessuna recensione ancora.</p>
            <p className="text-gray-500 text-sm mt-2">Sii il primo a lasciare una recensione!</p>
          </div>
        </div>
      </section>
    );
  }

  const doubled = [...reviews, ...reviews];

  return (
    <section className="py-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <p className="text-accent-electric text-sm tracking-widest uppercase mb-3">
          Cosa dicono di noi
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-white">
          Recensioni
        </h2>
      </div>

      <div className="relative overflow-hidden">
        <motion.div
          className="flex gap-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        >
          {doubled.map((review, i) => (
            <div
              key={`${review.id}-${i}`}
              className="shrink-0 w-80 bg-white/0.03 backdrop-blur-md border border-white/10 rounded-2xl p-6"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    size={14}
                    className={s < review.stars ? "text-accent-electric fill-accent-electric" : "text-gray-600"}
                  />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="border-t border-white/10 pt-3">
                <p className="text-white text-sm font-medium">{review.name}</p>
                <p className="text-gray-500 text-xs">{review.product.title}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}