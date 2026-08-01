"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";

interface SearchResult {
  id: string;
  title: string;
  handle: string;
  image: string;
  price: string;
}

export function SearchBar() {
  const t = useTranslations("Nav");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const runSearch = useCallback((q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    fetch(`/api/products/search?q=${encodeURIComponent(q.trim())}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(Array.isArray(data) ? data : []);
        setSearched(true);
      })
      .catch(() => setResults([]));
  }, []);

  useEffect(() => {
    const id = setTimeout(() => runSearch(query), 250);
    return () => clearTimeout(id);
  }, [query, runSearch]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const close = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setSearched(false);
  };

  const goToResults = () => {
    if (!query.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToResults();
  };

  return (
    <div ref={containerRef} className="relative">
      {open ? (
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-48 sm:w-64 px-3 py-2 text-sm rounded-lg bg-text-primary/5 border border-text-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-electric"
          />
          <button type="button" onClick={close} className="p-2 text-text-secondary hover:text-text-primary" aria-label={t("searchLabel")}>
            <X size={18} />
          </button>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-text-primary/5 rounded-lg transition-all"
          aria-label={t("searchLabel")}
        >
          <Search size={18} />
        </button>
      )}

      <AnimatePresence>
        {open && query.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white rounded-xl shadow-lg border border-text-primary/10 p-2 z-50 max-h-96 overflow-y-auto"
          >
            {results.length > 0 ? (
              <>
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.handle}`}
                    onClick={close}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-text-primary/5 transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-text-primary/5 shrink-0">
                      <Image src={product.image} alt="" fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-text-primary truncate">{product.title}</p>
                      <p className="text-xs text-text-muted">€{product.price}</p>
                    </div>
                  </Link>
                ))}
                <button
                  onClick={goToResults}
                  className="w-full text-left text-xs text-accent-electric px-2 py-2 hover:underline"
                >
                  {t("searchViewAll", { q: query.trim() })}
                </button>
              </>
            ) : searched ? (
              <p className="text-sm text-text-muted px-2 py-3">{t("searchNoResults")}</p>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
