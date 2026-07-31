"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, X } from "lucide-react";
import { Button } from "@/components/ui/primitives/Button";
import { toast } from "sonner";

export function ReviewModal({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [stars, setStars] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);

    window.addEventListener("open-review-modal", handler);

    return () => {
      window.removeEventListener("open-review-modal", handler);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !text) {
      toast.error("Compila tutti i campi");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, name, stars, text }),
      });

      if (!res.ok) {
        throw new Error("Errore durante l'invio");
      }

      toast.success("Recensione inviata! Grazie 🎉");

      setOpen(false);
      setName("");
      setText("");
      setStars(5);
    } catch {
      toast.error("Errore durante l'invio della recensione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-text-primary border border-white/20 rounded-3xl p-8 md:p-10 w-full max-w-lg shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Lascia una recensione
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Il tuo nome
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-accent-electric focus:outline-none"
                  placeholder="Es. Maria R."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valutazione
                </label>

                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStars(s)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={28}
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  La tua recensione
                </label>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-accent-electric focus:outline-none resize-none"
                  placeholder="Racconta la tua esperienza..."
                  required
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
                leftIcon={<Send size={16} />}
              >
                Invia recensione
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}