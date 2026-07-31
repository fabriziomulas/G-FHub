import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = await params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Prodotto non trovato" },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json(
      { message: "Prodotto eliminato con successo" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Errore eliminazione prodotto:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione del prodotto" },
      { status: 500 }
    );
  }
}