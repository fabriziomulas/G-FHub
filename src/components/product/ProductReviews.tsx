"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Star, MessageSquare, BadgeCheck } from "lucide-react";

interface Review {
  id: string;
  name: string;
  text: string;
  stars: number;
  images: string[];
  verified: boolean;
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
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-white text-sm font-medium">
                  {review.name}
                </span>

                {review.verified && (
                  <span className="flex items-center gap-1 text-accent-electric text-xs">
                    <BadgeCheck size={13} /> {t("verifiedBadge")}
                  </span>
                )}

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

              {review.images.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.images.map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element -- foto cliente in galleria compatta, non serve ottimizzazione next/image
                    <img key={url} src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
