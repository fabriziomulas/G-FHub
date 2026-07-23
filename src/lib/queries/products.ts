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

  return products.map((p: { id: string; title: string; handle: string; images: string[]; price: number; compareAtPrice: number | null }) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    image: p.images[0] || "/placeholder.png",
    price: p.price.toFixed(2),
    compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toFixed(2) : undefined,
  }));
}

export async function getAllProducts(): Promise<ProductBase[]> {
  const products = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p: { id: string; title: string; handle: string; images: string[]; price: number; compareAtPrice: number | null }) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    image: p.images[0] || "/placeholder.png",
    price: p.price.toFixed(2),
    compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toFixed(2) : undefined,
  }));
}

export async function getProductByHandle(handle: string) {
  const product = await prisma.product.findUnique({
    where: { handle },
    include: { variants: true },
  });

  if (!product) return null;

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    images: product.images,
    price: product.price.toFixed(2),
    compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toFixed(2) : "0.00",
    variants: product.variants,
  };
}