import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      items: { include: { product: { select: { title: true, images: true } } } },
    },
  });

  return NextResponse.json(orders);
}