"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/primitives/Button";
import { ArrowRight } from "lucide-react";

const WORD_REVEAL_STAGGER = 0.09;
const WORD_REVEAL_BASE_DELAY = 0.5;

function WordRevealLine({
  text,
  startDelay,
  className,
}: {
  text: string;
  startDelay: number;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom pb-1 mr-[0.25em] last:mr-0">
          <motion.span
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{
              delay: startDelay + i * WORD_REVEAL_STAGGER,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const t = useTranslations("Hero");
  const ref = useRef<HTMLDivElement>(null);

  const titleLine1 = t("titleLine1");
  const titleLine2 = t("titleLine2");
  const line2Delay = WORD_REVEAL_BASE_DELAY + titleLine1.split(" ").length * WORD_REVEAL_STAGGER;

  return (
    <section
      ref={ref}
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 text-center max-w-4xl px-6"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8 }}
          className="text-accent-electric text-sm md:text-base tracking-[0.2em] uppercase mb-6"
        >
          {t("eyebrow")}
        </motion.p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.9] tracking-tight mb-6">
          <WordRevealLine text={titleLine1} startDelay={WORD_REVEAL_BASE_DELAY} />
          <br />
          <WordRevealLine text={titleLine2} startDelay={line2Delay} className="text-gradient" />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: line2Delay + 0.6, duration: 0.8 }}
          className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: line2Delay + 0.8, duration: 0.8 }}
          className="flex gap-4 justify-center"
        >
          <Link href="/shop">
            <Button size="xl" rightIcon={<ArrowRight size={20} />}>
              {t("cta")}
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}