"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/primitives/Button";

export function Storytelling() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Testo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-text-muted text-sm tracking-widest uppercase mb-4">
              La nostra filosofia
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Progettato per
              <br />
              <span className="text-gradient">durare nel tempo</span>
            </h2>
            <p className="text-text-secondary text-lg mb-8 leading-relaxed">
              Ogni prodotto che trovi su Storeluxe è selezionato con cura maniacale.
              Materiali premium, design senza tempo, tecnologia all&apos;avanguardia.
              Non vendiamo prodotti, creiamo esperienze.
            </p>
            <div className="flex gap-6 mb-8">
              <div>
                <span className="text-3xl font-bold text-text-primary">10K+</span>
                <p className="text-text-muted text-sm mt-1">Clienti soddisfatti</p>
              </div>
              <div>
                <span className="text-3xl font-bold text-text-primary">50+</span>
                <p className="text-text-muted text-sm mt-1">Brand partner</p>
              </div>
              <div>
                <span className="text-3xl font-bold text-text-primary">4.9</span>
                <p className="text-text-muted text-sm mt-1">Valutazione media</p>
              </div>
            </div>
            <Button variant="primary" size="lg">
              Scopri la nostra storia
            </Button>
          </motion.div>

          {/* Immagini con parallax */}
          <div className="relative h-[500px]">
            <motion.div
              style={{ y: y1 }}
              className="absolute top-0 right-0 w-72 h-96 rounded-2xl overflow-hidden shadow-glow-blue"
            >
              <Image
                src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80"
                alt="Product 1"
                fill
                className="object-cover"
                sizes="300px"
              />
            </motion.div>
            <motion.div
              style={{ y: y2 }}
              className="absolute bottom-0 left-0 w-64 h-80 rounded-2xl overflow-hidden shadow-glow-purple"
            >
              <Image
                src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80"
                alt="Product 2"
                fill
                className="object-cover"
                sizes="260px"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}