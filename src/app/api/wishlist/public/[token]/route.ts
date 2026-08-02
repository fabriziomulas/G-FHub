import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/wishlist/public/[token] -> lista pubblica (sola lettura) di una wishlist condivisa
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const user = await prisma.user.findUnique({ where: { wishlistShareToken: token } });
  if (!user) return NextResponse.json({ error: "Lista non trovata" }, { status: 404 });

  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: { product: { select: { id: true, title: true, handle: true, price: true, images: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ownerName: user.name, items });
}
