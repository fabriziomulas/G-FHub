"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    title: "Anelli",
    subtitle: "Eleganza senza tempo",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
    href: "/shop/anelli",
  },
  {
    title: "Collane",
    subtitle: "Luce e raffinatezza",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5f1f2b6?w=800&q=80",
    href: "/shop/collane",
  },
  {
    title: "Bracciali",
    subtitle: "Dettagli preziosi",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80",
    href: "/shop/bracciali",
  },
];

export function Categories() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-accent-electric text-sm tracking-widest uppercase mb-3">
            Collezioni
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Categorie
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <div className="glass-dark rounded-2xl overflow-hidden border-white/20">
                <Link
                  href={cat.href}
                  className="group relative block aspect-4/5"
                >
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-text-primary via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-1">{cat.title}</h3>
                    <p className="text-accent-electric/80 text-sm mb-3">{cat.subtitle}</p>
                    <span className="inline-flex items-center gap-1 text-accent-electric text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
                      Scopri <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}