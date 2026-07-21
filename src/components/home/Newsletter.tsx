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
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm text-accent-electric mb-6">
          <Sparkles size={14} />
          Accesso anticipato
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
          Rimani aggiornato
        </h2>
        <p className="text-text-secondary text-lg mb-10">
          Iscriviti alla newsletter per offerte esclusive, nuovi arrivi e contenuti premium.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
          <Input
            variant="glass"
            type="email"
            placeholder="email@esempio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" loading={loading}>
            Iscriviti
          </Button>
        </form>
        <p className="text-text-muted text-xs mt-4">
          Nessuno spam. Puoi annullare l&apos;iscrizione in qualsiasi momento.
        </p>
      </motion.div>
    </section>
  );
}