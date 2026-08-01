"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";

const CATEGORIES = ["anelli", "collane", "bracciali"] as const;

export function ShopFilters() {
  const t = useTranslations("Shop");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const q = searchParams.get("q") || "";
  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const id = setTimeout(() => {
      const currentMin = searchParams.get("min") || "";
      const currentMax = searchParams.get("max") || "";
      if (minPrice !== currentMin || maxPrice !== currentMax) {
        updateParams({ min: minPrice || null, max: maxPrice || null });
      }
    }, 500);
    return () => clearTimeout(id);
    // debounce solo su minPrice/maxPrice — updateParams e searchParams sono letti al momento dell'esecuzione, non vanno tra le dipendenze
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice]);

  const hasActiveFilters = category || sort !== "newest" || minPrice || maxPrice || q;

  const clearAll = () => {
    setMinPrice("");
    setMaxPrice("");
    router.replace(pathname);
  };

  return (
    <div className="mb-8 space-y-3">
      {q && (
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span>{t("searchResultsFor", { q })}</span>
          <button onClick={() => updateParams({ q: null })} className="text-gray-500 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={category}
          onChange={(e) => updateParams({ category: e.target.value || null })}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm [&>option]:bg-text-primary [&>option]:text-white"
        >
          <option value="">{t("filterAllCategories")}</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {t(`filterCategory_${cat}` as "filterCategory_anelli")}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder={t("filterMinPrice")}
          className="w-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500"
        />
        <span className="text-gray-500 text-sm">—</span>
        <input
          type="number"
          min="0"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder={t("filterMaxPrice")}
          className="w-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500"
        />

        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value === "newest" ? null : e.target.value })}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm [&>option]:bg-text-primary [&>option]:text-white"
        >
          <option value="newest">{t("sortNewest")}</option>
          <option value="price-asc">{t("sortPriceAsc")}</option>
          <option value="price-desc">{t("sortPriceDesc")}</option>
        </select>

        {hasActiveFilters && (
          <button onClick={clearAll} className="text-sm text-gray-400 hover:text-white transition-colors">
            {t("filterClear")}
          </button>
        )}
      </div>
    </div>
  );
}
