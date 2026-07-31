"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Heart, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/composites/Card";
import { Badge } from "@/components/ui/primitives/Badge";
import { Button } from "@/components/ui/primitives/Button";
import { useCart } from "@/stores/cart";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { trackEvent } from "@/lib/analytics";
import { Link } from "@/i18n/navigation";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    handle: string;
    image: string;
    price: string;
    compareAtPrice?: string;
    inStock?: boolean;
    badge?: string;
    badgeColor?: "electric" | "purple" | "success" | "error";
  };
  index?: number;
}

function isValidImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return url.startsWith("/");
  }
}

const PLACEHOLDER = "/placeholder.png";

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const t = useTranslations("Product");
  const hasDiscount = product.compareAtPrice && product.compareAtPrice !== product.price;
  const imageSrc = isValidImageUrl(product.image) ? product.image : PLACEHOLDER;
  const isAvailable = product.inStock !== false;
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const liked = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAvailable) return;
    addItem({
      id: product.id,
      variantId: product.id,
      title: product.title,
      image: imageSrc,
      price: parseFloat(product.price),
      quantity: 1,
    });
    trackEvent("add_to_cart", {
      item_id: product.id,
      item_name: product.title,
      value: parseFloat(product.price),
      currency: "EUR",
    });
    toast.success(t("addedToCart", { title: product.title }));
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id, product.title);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link href={`/product/${product.handle}`}>
        <Card variant="interactive" padding="none" className="group overflow-hidden border-white/20">
          <div className="relative aspect-square overflow-hidden bg-white/5">
            <Image
              src={imageSrc}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
            {!isAvailable && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{t("outOfStock")}</span>
              </div>
            )}
            {product.badge && (
              <div className="absolute top-3 left-3">
                <Badge color={product.badgeColor || "electric"} size="sm">{product.badge}</Badge>
              </div>
            )}
            <button
              onClick={handleWishlist}
              className={cn(
                "absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm transition-all z-10",
                liked
                  ? "bg-accent-electric text-white shadow-glow-blue"
                  : "bg-white/20 text-white opacity-0 group-hover:opacity-100 hover:bg-white/30"
              )}
              aria-label={liked ? t("wishlistRemove") : t("wishlistAdd")}
            >
              <Heart size={18} className={cn(liked && "fill-white")} />
            </button>
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 z-10">
              <Button size="sm" className="w-full" leftIcon={<ShoppingBag size={14} />} onClick={handleAddToCart} disabled={!isAvailable}>
                {isAvailable ? t("addShort") : t("outOfStock")}
              </Button>
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-sm font-medium text-white group-hover:text-accent-electric transition-colors line-clamp-1">
              {product.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-semibold text-white">€{product.price}</span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">€{product.compareAtPrice}</span>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}