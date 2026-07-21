"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    // Refresh multipli per sicurezza
    const refresh = () => lenis.resize();
    setTimeout(refresh, 100);
    setTimeout(refresh, 500);
    setTimeout(refresh, 1000);

    window.addEventListener("resize", refresh);

    return () => {
      lenis.destroy();
      window.removeEventListener("resize", refresh);
    };
  }, []);

  return null;
}