import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

const VALID_CATEGORIES = ["anelli", "collane", "bracciali"];

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(new RegExp("[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]", "g"), "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, price: true, stock: true, isNew: true, isBestSeller: true, isOnSale: true },
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "Il titolo è obbligatorio" }, { status: 400 });
    }

    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Prezzo non valido" }, { status: 400 });
    }

    const parsedStock = parseInt(body.stock, 10);
    const stock = Number.isFinite(parsedStock) && parsedStock >= 0 ? parsedStock : 0;

    const category = VALID_CATEGORIES.includes(body.category) ? body.category : "";

    const baseHandle = slugify(title);
    let handle = baseHandle;

    let product;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        product = await prisma.product.create({
          data: {
            title,
            handle,
            description: body.description || "",
            price,
            stock,
            images: body.images || [],
            category,
            featured: body.featured !== false,
            inStock: true,
            isNew: body.isNew || false,
            isBestSeller: body.isBestSeller || false,
            isOnSale: body.isOnSale || false,
          },
        });
        break;
      } catch (err) {
        const isUniqueClash =
          err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
        if (isUniqueClash && attempt < 2) {
          handle = `${baseHandle}-${Date.now().toString().slice(-4)}`;
          continue;
        }
        throw err;
      }
    }

    if (!product) {
      return NextResponse.json({ error: "Errore creazione prodotto" }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath("/shop");
    if (product.isNew) revalidatePath("/shop/new");
    if (product.isBestSeller) revalidatePath("/shop/best-seller");
    if (product.isOnSale) revalidatePath("/shop/offerte");
    if (product.category) revalidatePath(`/shop/${product.category}`);

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Errore creazione prodotto" }, { status: 500 });
  }
}
