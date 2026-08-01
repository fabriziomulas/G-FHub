"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/primitives/Button";

export function Storytelling() {
  const t = useTranslations("Storytelling");
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  const stats = [
    { value: t("stat1Value"), label: t("stat1Label") },
    { value: t("stat2Value"), label: t("stat2Label") },
    { value: t("stat3Value"), label: t("stat3Label") },
  ];

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-accent-electric text-sm tracking-widest uppercase mb-4">
              {t("eyebrow")}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t("headingLine1")}
              <br />
              <span className="text-gradient">{t("headingLine2")}</span>
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              {t("body")}
            </p>
            <div className="flex gap-6 mb-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <span className="text-3xl font-bold text-white">{stat.value}</span>
                  <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <Link href="/chi-siamo">
              <Button variant="primary" size="lg">
                {t("cta")}
              </Button>
            </Link>
          </motion.div>

          <div className="relative h-125">
            <motion.div
              style={{ y: y1 }}
              className="absolute top-0 right-0 w-72 h-96 rounded-2xl overflow-hidden shadow-glow-blue"
            >
              <Image
                src="https://images.unsplash.com/photo-1589779957013-1d9d02b139f8?w=600&q=80"
                alt="Collana e bracciale G&F Hub indossati"
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
                src="https://images.unsplash.com/photo-1755311901187-b066feb3fdbb?w=600&q=80"
                alt="Anelli G&F Hub indossati"
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