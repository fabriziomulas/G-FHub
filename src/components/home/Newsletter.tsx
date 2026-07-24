"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/primitives/Input";
import { Button } from "@/components/ui/primitives/Button";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      toast.success("Iscrizione completata! Controlla la tua email.");
      setEmail("");
      setLoading(false);
    }, 1000);
  };

  return (
    <section className="py-32 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/[0.01] backdrop-blur-md border border-white/5 rounded-3xl p-10 md:p-14 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-accent-electric/20 border border-accent-electric/30 px-4 py-1.5 rounded-full text-sm text-accent-electric mb-6">
            <Sparkles size={14} />
            Accesso anticipato
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Rimani aggiornato
          </h2>
          <p className="text-gray-300 text-lg mb-10">
            Iscriviti alla newsletter per offerte esclusive, nuovi arrivi e contenuti premium.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <Input
              variant="glass"
              type="email"
              placeholder="email@esempio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
            />
            <Button type="submit" loading={loading}>
              Iscriviti
            </Button>
          </form>
          <p className="text-gray-500 text-xs mt-4">
            Nessuno spam. Puoi annullare l&apos;iscrizione in qualsiasi momento.
          </p>
        </motion.div>
      </div>
    </section>
  );
}