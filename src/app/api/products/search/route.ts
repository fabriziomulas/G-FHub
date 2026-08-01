import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_RESULTS = 6;

// GET /api/products/search?q=... -> risultati rapidi per la ricerca nella navbar
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const products = await prisma.product.findMany({
    where: { title: { contains: q, mode: "insensitive" } },
    take: MAX_RESULTS,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    products.map((p) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      image: p.images[0] || "/placeholder.png",
      price: p.price.toFixed(2),
    }))
  );
}
