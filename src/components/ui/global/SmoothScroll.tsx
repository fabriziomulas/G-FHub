"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export function SmoothScroll() {
  const pathname = usePathname();

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

    const refresh = () => lenis.resize();
    window.addEventListener("resize", refresh);

    // Il contenuto spesso cresce dopo il mount (recensioni, wishlist, coupon
    // caricati via fetch, immagini che finiscono di caricare): senza questo
    // osservatore Lenis resta bloccato sull'altezza calcolata al mount e
    // impedisce di scorrere fino alla fine reale della pagina.
    const resizeObserver = new ResizeObserver(() => refresh());
    resizeObserver.observe(document.documentElement);

    return () => {
      lenis.destroy();
      window.removeEventListener("resize", refresh);
      resizeObserver.disconnect();
    };
  }, [pathname]);

  return null;
}