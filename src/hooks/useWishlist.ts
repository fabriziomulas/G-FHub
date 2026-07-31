"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface WishlistProduct {
  product: {
    id: string;
    title: string;
    handle: string;
    price: number;
    images: string[];
  };
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (productId: string, title: string) => {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    if (data.added) {
      toast.success(`${title} aggiunto ai preferiti!`);
    } else {
      toast.success(`${title} rimosso dai preferiti`);
    }
    fetchWishlist();
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.product.id === productId);
  };

  return { items, loading, toggleWishlist, isInWishlist, refetch: fetchWishlist };
}