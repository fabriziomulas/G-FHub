import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface ProductBase {
  id: string;
  title: string;
  handle: string;
  image: string;
  price: string;
  compareAtPrice: string | undefined;
}

export async function getFeaturedProducts(): Promise<ProductBase[]> {
  const products = await prisma.product.findMany({
    where: { featured: true, inStock: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    image: p.images[0] || "/placeholder.png",
    price: p.price.toFixed(2),
    compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toFixed(2) : undefined,
  }));
}

export async function getAllProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    image: p.images[0] || "/placeholder.png",
    price: p.price.toFixed(2),
    compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toFixed(2) : undefined,
    inStock: p.inStock,
  }));
}

export type ProductSort = "newest" | "price-asc" | "price-desc";

export async function getFilteredProducts(params: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  q?: string;
}) {
  const where: Prisma.ProductWhereInput = {};

  if (params.category) where.category = params.category;
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    where.price = {
      ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
      ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
    };
  }
  if (params.q) {
    where.title = { contains: params.q, mode: "insensitive" };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    params.sort === "price-asc"
      ? { price: "asc" }
      : params.sort === "price-desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const products = await prisma.product.findMany({ where, orderBy });

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    image: p.images[0] || "/placeholder.png",
    price: p.price.toFixed(2),
    compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toFixed(2) : undefined,
    inStock: p.inStock,
  }));
}

export async function getProductsByCategory(category: string) {
  const products = await prisma.product.findMany({
    where: { category, inStock: true },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    image: p.images[0] || "/placeholder.png",
    price: p.price.toFixed(2),
    compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toFixed(2) : undefined,
  }));
}

export const getProductByHandle = cache(async (handle: string) => {
  const product = await prisma.product.findUnique({
    where: { handle },
    include: { variants: true, reviews: { select: { stars: true } } },
  });

  if (!product) return null;

  const reviewCount = product.reviews.length;
  const averageRating = reviewCount
    ? product.reviews.reduce((sum, r) => sum + r.stars, 0) / reviewCount
    : null;

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    images: product.images,
    category: product.category,
    price: product.price.toFixed(2),
    compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toFixed(2) : "0.00",
    inStock: product.inStock,
    stock: product.stock,
    variants: product.variants,
    averageRating,
    reviewCount,
  };
});