import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, price: true, stock: true, isNew: true, isBestSeller: true, isOnSale: true },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let handle = slugify(body.title);
    const existing = await prisma.product.findUnique({ where: { handle } });
    if (existing) handle = `${handle}-${Date.now().toString().slice(-4)}`;

    const product = await prisma.product.create({
      data: {
        title: body.title,
        handle,
        description: body.description || "",
        price: body.price,
        stock: body.stock ? parseInt(body.stock) : 0,
        images: body.images || [],
        featured: true,
        inStock: true,
        isNew: body.isNew || false,
        isBestSeller: body.isBestSeller || false,
        isOnSale: body.isOnSale || false,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Errore creazione prodotto" }, { status: 500 });
  }
}