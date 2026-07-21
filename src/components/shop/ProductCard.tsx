"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/composites/Card";
import { Badge } from "@/components/ui/primitives/Badge";
import { Button } from "@/components/ui/primitives/Button";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    handle: string;
    image: string;
    price: string;
    compareAtPrice?: string;
    badge?: string;
    badgeColor?: "electric" | "purple" | "success" | "error";
  };
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const hasDiscount = product.compareAtPrice && product.compareAtPrice !== product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card variant="interactive" padding="none" className="group overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-background-secondary">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 left-3">
              <Badge color={product.badgeColor || "electric"} size="sm">
                {product.badge}
              </Badge>
            </div>
          )}
          {/* Wishlist */}
          <button
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Aggiungi ai preferiti"
          >
            <Heart size={16} className="text-white" />
          </button>
          {/* Quick add */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
            <Button size="sm" className="w-full" leftIcon={<ShoppingBag size={14} />}>
              Aggiungi
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <Link href={`/product/${product.handle}`}>
            <h3 className="text-sm font-medium text-text-primary hover:text-accent-electric transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold text-text-primary">
              €{product.price}
            </span>
            {hasDiscount && (
              <span className="text-xs text-text-muted line-through">
                €{product.compareAtPrice}
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}