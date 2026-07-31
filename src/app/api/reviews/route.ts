import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reviews?productId=xxx  -> tutte le recensioni (o filtrate per prodotto)
// GET /api/reviews                -> tutte le recensioni (per il carousel in home)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  const reviews = await prisma.review.findMany({
    where: productId ? { productId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { product: { select: { title: true, handle: true } } },
  });

  return NextResponse.json(reviews);
}

// POST /api/reviews -> crea una nuova recensione
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { productId, name, stars, text } = body;

  if (!productId || !name || !stars || !text) {
    return NextResponse.json(
      { error: "Campi mancanti" },
      { status: 400 }
    );
  }

  const review = await prisma.review.create({
    data: {
      productId,
      name,
      stars: Number(stars),
      text,
    },
  });

  return NextResponse.json(review, { status: 201 });
}