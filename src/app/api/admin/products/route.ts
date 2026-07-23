import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const product = await prisma.product.create({
      data: {
        title: body.title,
        handle: body.handle,
        description: body.description || "",
        price: body.price,
        compareAtPrice: body.compareAtPrice || null,
        images: body.images || [],
        category: body.category || "",
        featured: true,
        inStock: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Errore creazione prodotto" }, { status: 500 });
  }
}