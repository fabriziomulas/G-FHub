import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;

  try {
    const product = await prisma.product.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product/${product.handle}`);
    if (product.isNew) revalidatePath("/shop/new");
    if (product.isBestSeller) revalidatePath("/shop/best-seller");
    if (product.isOnSale) revalidatePath("/shop/offerte");
    if (product.category) revalidatePath(`/shop/${product.category}`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Errore eliminazione" }, { status: 500 });
  }
}
