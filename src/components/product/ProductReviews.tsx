"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/primitives/Button";
import { toast } from "sonner";

interface Review {
  id: string;
  name: string;
  text: string;
  stars: number;
  createdAt: string;
}

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [stars, setStars] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !text) {
      toast.error("Compila tutti i campi");
      return;
    }

    setLoading(true);

    try {
      const newReview: Review = {
        id: Date.now().toString(),
        name,
        text,
        stars,
        createdAt: new Date().toISOString(),
      };

      setReviews((prev) => [newReview, ...prev]);

      setName("");
      setText("");
      setStars(5);
      setShowForm(false);

      toast.success("Recensione inviata!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 border-t border-white/10 pt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Recensioni ({reviews.length})
        </h2>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowForm((prev) => !prev)}
        >
          Scrivi recensione
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-white/0.03 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6 space-y-4"
          >
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Nome
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                placeholder="Il tuo nome"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Valutazione
              </label>

              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStars(s)}
                    className="p-0.5"
                  >
                    <Star
                      size={20}
                      className={
                        s <= stars
                          ? "text-accent-electric fill-accent-electric"
                          : "text-gray-600"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Recensione
              </label>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm resize-none"
                placeholder="Cosa ne pensi di questo prodotto?"
                required
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              size="sm"
              leftIcon={<Send size={14} />}
            >
              Invia recensione
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Nessuna recensione. Sii il primo!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white/0.03 border border-white/10 rounded-xl p-4"
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

              <p className="text-gray-300 text-sm">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}