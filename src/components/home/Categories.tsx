"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    title: "Elettronica",
    subtitle: "Design e tecnologia",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80",
    href: "/shop/elettronica",
  },
  {
    title: "Moda",
    subtitle: "Stile senza tempo",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
    href: "/shop/moda",
  },
  {
    title: "Casa",
    subtitle: "Eleganza quotidiana",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
    href: "/shop/casa",
  },
];

export function Categories() {
  return (
    <section className="py-24 px-6 bg-background-secondary">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-text-muted text-sm tracking-widest uppercase mb-3">
            Esplora
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary">
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
              <Link
                href={cat.href}
                className="group relative block aspect-[4/5] rounded-2xl overflow-hidden"
              >
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-1">{cat.title}</h3>
                  <p className="text-white/70 text-sm mb-3">{cat.subtitle}</p>
                  <span className="inline-flex items-center gap-1 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-x-0 group-hover:translate-x-1 transition-transform">
                    Scopri <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}