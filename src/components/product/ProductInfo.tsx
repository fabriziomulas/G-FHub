"use client";

import { useState } from "react";
import { Button } from "@/components/ui/primitives/Button";
import { Badge } from "@/components/ui/primitives/Badge";
import { ShoppingBag, Heart, PenLine } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/stores/cart";

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
}

export function ProductInfo({
  title,
  description,
  price,
  compareAtPrice,
  variants,
}: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const hasDiscount = compareAtPrice !== "0.00" && compareAtPrice !== price;
  const { addItem } = useCart();

  const options = variants.reduce<Record<string, string[]>>((acc, v) => {
    v.selectedOptions.forEach((opt) => {
      if (!acc[opt.name]) acc[opt.name] = [];
      if (!acc[opt.name].includes(opt.value)) acc[opt.name].push(opt.value);
    });
    return acc;
  }, {});

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem({
      id: selectedVariant.id,
      variantId: selectedVariant.id,
      title: title,
      image: "",
      price: parseFloat(selectedVariant.price.amount),
      quantity: 1,
      options: selectedVariant.selectedOptions.map((o) => o.value).join(" / "),
    });
    toast.success(`${title} aggiunto al carrello!`);
  };

  const handleOpenReview = () => {
    window.dispatchEvent(new CustomEvent("open-review-modal"));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {title}
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-2xl font-semibold text-white">
            €{parseFloat(price).toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-lg text-gray-400 line-through">
              €{parseFloat(compareAtPrice).toFixed(2)}
            </span>
          )}
          {hasDiscount && (
            <Badge color="success" size="sm">
              -{Math.round((1 - parseFloat(price) / parseFloat(compareAtPrice)) * 100)}%
            </Badge>
          )}
        </div>
      </div>

      {Object.entries(options).map(([name, values]) => (
        <div key={name}>
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            {name}
          </h3>
          <div className="flex gap-2 flex-wrap">
            {values.map((value) => {
              const matchingVariant = variants.find((v) =>
                v.selectedOptions.some(
                  (o) => o.name === name && o.value === value
                )
              );
              const isSelected = selectedVariant?.selectedOptions.some(
                (o) => o.name === name && o.value === value
              );
              const isAvailable = matchingVariant?.availableForSale;

              return (
                <button
                  key={value}
                  onClick={() => matchingVariant && setSelectedVariant(matchingVariant)}
                  disabled={!isAvailable}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-accent-electric text-white"
                      : isAvailable
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-white/5 text-gray-500 line-through cursor-not-allowed"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="text-gray-300 leading-relaxed text-sm"
        dangerouslySetInnerHTML={{ __html: description }}
      />

      <div className="flex gap-3 pt-4">
        <Button
          size="xl"
          className="flex-1"
          leftIcon={<ShoppingBag size={20} />}
          onClick={handleAddToCart}
          disabled={!selectedVariant}
        >
          {selectedVariant?.availableForSale ? "Aggiungi al carrello" : "Esaurito"}
        </Button>
        <Button variant="secondary" size="xl" className="aspect-square">
          <Heart size={20} />
        </Button>
      </div>

      <Button
        size="xl"
        className="w-full"
        variant="primary"
        leftIcon={<PenLine size={20} />}
        onClick={handleOpenReview}
      >
        Scrivi una recensione
      </Button>

      {selectedVariant && (
        <p className="text-xs text-gray-500">
          {selectedVariant.availableForSale
            ? "Disponibile"
            : "Non disponibile"}
        </p>
      )}
    </div>
  );
}