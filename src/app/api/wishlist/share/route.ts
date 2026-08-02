import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { randomBytes } from "node:crypto";

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.id as string;
  } catch {
    return null;
  }
}

// POST /api/wishlist/share -> genera (o riusa) il token pubblico per condividere la propria wishlist
export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  let token = user.wishlistShareToken;
  if (!token) {
    token = randomBytes(9).toString("base64url");
    await prisma.user.update({ where: { id: userId }, data: { wishlistShareToken: token } });
  }

  return NextResponse.json({ token });
}
