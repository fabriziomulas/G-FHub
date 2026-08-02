import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_IDS = 8;

// GET /api/products/by-ids?ids=a,b,c -> prodotti corrispondenti (per "Visti di recente")
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, MAX_IDS);

  if (ids.length === 0) {
    return NextResponse.json([]);
  }

  const products = await prisma.product.findMany({
    where: { id: { in: ids }, inStock: true },
  });

  return NextResponse.json(
    products.map((p) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      image: p.images[0] || "/placeholder.png",
      price: p.price.toFixed(2),
      compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toFixed(2) : undefined,
    }))
  );
}
