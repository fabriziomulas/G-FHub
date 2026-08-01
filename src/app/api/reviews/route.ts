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
  const { productId, name, email, stars, text, images } = body;

  if (!productId || !name || !stars || !text) {
    return NextResponse.json(
      { error: "Campi mancanti" },
      { status: 400 }
    );
  }

  // "Acquisto verificato": l'email inviata compare tra i clienti che hanno
  // un ordine pagato (o oltre) contenente questo prodotto. Non blocca chi
  // non trova corrispondenza (es. regalo ricevuto da altra email) — mostra
  // solo il badge quando la corrispondenza c'è.
  let verified = false;
  if (email) {
    const matchingOrder = await prisma.order.findFirst({
      where: {
        customerEmail: { equals: email, mode: "insensitive" },
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
        items: { some: { productId } },
      },
      select: { id: true },
    });
    verified = Boolean(matchingOrder);
  }

  const review = await prisma.review.create({
    data: {
      productId,
      name,
      email: email || "",
      stars: Number(stars),
      text,
      images: Array.isArray(images) ? images.slice(0, 3) : [],
      verified,
    },
  });

  return NextResponse.json(review, { status: 201 });
}