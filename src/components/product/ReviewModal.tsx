"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Star, Send, X, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/primitives/Button";
import { toast } from "sonner";

const MAX_PHOTOS = 3;

export function ReviewModal({ productId }: { productId: string }) {
  const t = useTranslations("Reviews");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [stars, setStars] = useState(5);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remaining = MAX_PHOTOS - images.length;
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        const data = new FormData();
        data.append("file", file);
        const res = await fetch("/api/reviews/upload", { method: "POST", body: data });
        const json = await res.json();
        if (json.url) uploaded.push(json.url);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch {
      toast.error(t("uploadError"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    const handler = () => setOpen(true);

    window.addEventListener("open-review-modal", handler);

    return () => {
      window.removeEventListener("open-review-modal", handler);
    };
  }, []);

  // Link diretto dall'email "com'è il tuo ordine?" (?review=1): apre subito il
  // modulo recensione e ripulisce l'URL per non riaprirlo a un refresh.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("review") === "1") {
      // One-time read of the URL on mount to open the modal from the "how's
      // your order?" email link — there's no way to derive this during render
      // since it depends on a browser API, not React state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
      params.delete("review");
      const query = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (query ? `?${query}` : ""));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !text) {
      toast.error(t("requiredToast"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, name, email, stars, text, images }),
      });

      if (!res.ok) {
        throw new Error("Errore durante l'invio");
      }

      toast.success(t("successToast"));

      window.dispatchEvent(new CustomEvent("review-added", { detail: productId }));

      setOpen(false);
      setName("");
      setEmail("");
      setText("");
      setStars(5);
      setImages([]);
    } catch {
      toast.error(t("errorToast"));
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
                {t("modalTitle")}
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
                  {t("nameLabel")}
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-accent-electric focus:outline-none"
                  placeholder={t("namePlaceholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("emailLabel")}
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-accent-electric focus:outline-none"
                  placeholder={t("emailPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("ratingLabel")}
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
                  {t("textLabel")}
                </label>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-accent-electric focus:outline-none resize-none"
                  placeholder={t("textPlaceholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("photosLabel")}
                </label>

                <div className="flex items-center gap-2 flex-wrap">
                  {images.map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element -- anteprima immediata post-upload, non serve ottimizzazione next/image
                    <img key={url} src={url} alt="" className="w-14 h-14 rounded-lg object-cover border border-white/10" />
                  ))}
                  {images.length < MAX_PHOTOS && (
                    <label className="w-14 h-14 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/40 cursor-pointer transition-colors">
                      {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-1.5">{t("photosHint")}</p>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
                leftIcon={<Send size={16} />}
              >
                {t("submit")}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}