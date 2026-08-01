"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Star, MessageSquare, BadgeCheck } from "lucide-react";

interface Review {
  id: string;
  name: string;
  text: string;
  stars: number;
  verified: boolean;
  product: { title: string; handle: string };
}

const MAX_VISIBLE = 6;

export function ReviewCarousel() {
  const t = useTranslations("Home");
  const tReviews = useTranslations("Reviews");
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
      <section className="py-14 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-accent-electric text-sm tracking-widest uppercase mb-3">
            {t("reviewsEyebrow")}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t("reviewsTitle")}
          </h2>
          <div className="bg-white/0.03 backdrop-blur-md border border-white/10 rounded-3xl p-12 max-w-lg mx-auto">
            <MessageSquare size={40} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">{t("reviewsEmptyTitle")}</p>
            <p className="text-gray-500 text-sm mt-2">{t("reviewsEmptyText")}</p>
          </div>
        </div>
      </section>
    );
  }

  const visible = reviews.slice(0, MAX_VISIBLE);

  return (
    <section className="py-14 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-accent-electric text-sm tracking-widest uppercase mb-3">
            {t("reviewsEyebrow")}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            {t("reviewsTitle")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-white/0.03 backdrop-blur-md border border-white/10 rounded-2xl p-6"
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
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white text-sm font-medium">{review.name}</p>
                  {review.verified && (
                    <span className="flex items-center gap-1 text-accent-electric text-xs">
                      <BadgeCheck size={12} /> {tReviews("verifiedBadge")}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs">{review.product.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
