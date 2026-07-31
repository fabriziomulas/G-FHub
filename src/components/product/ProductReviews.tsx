"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Star, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  name: string;
  text: string;
  stars: number;
  createdAt: string;
}

export function ProductReviews({ productId }: { productId: string }) {
  const t = useTranslations("Reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail === productId) fetchReviews();
    };

    window.addEventListener("review-added", handler);
    return () => window.removeEventListener("review-added", handler);
  }, [productId, fetchReviews]);

  return (
    <div className="mt-12 border-t border-white/10 pt-10">
      <h2 className="text-xl font-bold text-white mb-6">
        {t("title", { count: reviews.length })}
      </h2>

      {loading ? null : reviews.length === 0 ? (
        <div className="flex items-center gap-3 text-gray-500 text-sm">
          <MessageSquare size={18} />
          {t("empty")}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white text-sm font-medium">
                  {review.name}
                </span>

                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      size={12}
                      className={
                        s < review.stars
                          ? "text-accent-electric fill-accent-electric"
                          : "text-gray-600"
                      }
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-300 text-sm">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
