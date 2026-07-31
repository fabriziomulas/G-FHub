"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/primitives/Button";
import { Badge } from "@/components/ui/primitives/Badge";
import { ShoppingBag, Heart, PenLine, Truck, RotateCcw, ShieldCheck, Flame } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/stores/cart";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/cn";
import { trackEvent } from "@/lib/analytics";

interface Variant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string };
  selectedOptions: Array<{ name: string; value: string }>;
}

interface ProductInfoProps {
  title: string;
  description: string;
  price: string;
  compareAtPrice: string;
  variants: Variant[];
  productId: string;
  inStock: boolean;
  stock: number;
}

export function ProductInfo({
  title,
  description,
  price,
  compareAtPrice,
  variants,
  productId,
  inStock,
  stock,
}: ProductInfoProps) {
  const t = useTranslations("Product");
  const hasVariants = variants.length > 0 && variants[0]?.title !== "Default Title";
  const [selectedVariant, setSelectedVariant] = useState(hasVariants ? variants[0] : null);
  const hasDiscount = compareAtPrice !== "0.00" && compareAtPrice !== price;
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const liked = isInWishlist(productId);

  const isAvailable = hasVariants ? (selectedVariant?.availableForSale ?? false) : inStock;

  const options = variants.reduce<Record<string, string[]>>((acc, v) => {
    v.selectedOptions.forEach((opt) => {
      if (!acc[opt.name]) acc[opt.name] = [];
      if (!acc[opt.name].includes(opt.value)) acc[opt.name].push(opt.value);
    });
    return acc;
  }, {});

  useEffect(() => {
    trackEvent("view_item", {
      item_id: productId,
      item_name: title,
      value: parseFloat(price),
      currency: "EUR",
    });
  }, [productId, title, price]);

  const handleAddToCart = () => {
    addItem({
      id: productId,
      variantId: selectedVariant?.id || productId,
      title: title,
      image: "",
      price: parseFloat(price),
      quantity: 1,
      options: selectedVariant?.selectedOptions.map((o) => o.value).join(" / ") || "",
    });
    trackEvent("add_to_cart", {
      item_id: productId,
      item_name: title,
      value: parseFloat(price),
      currency: "EUR",
    });
    toast.success(t("addedToCart", { title }));
  };

  const handleWishlist = () => {
    toggleWishlist(productId, title);
  };

  const handleOpenReview = () => {
    window.dispatchEvent(new CustomEvent("open-review-modal"));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-2xl font-semibold text-white">€{parseFloat(price).toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-lg text-gray-400 line-through">€{parseFloat(compareAtPrice).toFixed(2)}</span>
          )}
          {hasDiscount && (
            <Badge color="success" size="sm">
              -{Math.round((1 - parseFloat(price) / parseFloat(compareAtPrice)) * 100)}%
            </Badge>
          )}
        </div>

        {!hasVariants && inStock && stock > 0 && stock <= 5 && (
          <p className="flex items-center gap-1.5 text-amber-400 text-sm mt-3">
            <Flame size={14} />
            {stock === 1 ? t("lastUnit") : t("unitsLeft", { count: stock })}
          </p>
        )}
      </div>

      {hasVariants && Object.entries(options).map(([name, values]) => {
        if (!name || name === "Title" || values.length === 0) return null;
        return (
          <div key={name}>
            <h3 className="text-sm font-medium text-gray-300 mb-2">{name}</h3>
            <div className="flex gap-2 flex-wrap">
              {values.map((value) => {
                const matchingVariant = variants.find((v) =>
                  v.selectedOptions.some((o) => o.name === name && o.value === value)
                );
                const isSelected = selectedVariant?.selectedOptions.some((o) => o.name === name && o.value === value);
                const isAvail = matchingVariant?.availableForSale;
                return (
                  <button
                    key={value}
                    onClick={() => matchingVariant && setSelectedVariant(matchingVariant)}
                    disabled={!isAvail}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSelected ? "bg-accent-electric text-white" : isAvail ? "bg-white/10 text-white hover:bg-white/20" : "bg-white/5 text-gray-500 line-through cursor-not-allowed"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">{description}</div>

      <div className="flex gap-3 pt-4">
        <Button size="xl" className="flex-1" leftIcon={<ShoppingBag size={20} />} onClick={handleAddToCart} disabled={!isAvailable}>
          {isAvailable ? t("addToCart") : t("outOfStock")}
        </Button>
        <Button
          size="xl"
          className={cn(
            "aspect-square",
            liked ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
          )}
          onClick={handleWishlist}
        >
          <Heart size={20} className={cn(liked && "fill-white")} />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white/5 border border-white/10 rounded-xl">
          <Truck size={18} className="text-accent-electric" />
          <span className="text-gray-300 text-xs leading-tight">{t("trustShipping")}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white/5 border border-white/10 rounded-xl">
          <RotateCcw size={18} className="text-accent-electric" />
          <span className="text-gray-300 text-xs leading-tight">{t("trustReturns")}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white/5 border border-white/10 rounded-xl">
          <ShieldCheck size={18} className="text-accent-electric" />
          <span className="text-gray-300 text-xs leading-tight">{t("trustSecure")}</span>
        </div>
      </div>

      <Button size="xl" className="w-full" variant="primary" leftIcon={<PenLine size={20} />} onClick={handleOpenReview}>
        {t("writeReview")}
      </Button>
    </div>
  );
}