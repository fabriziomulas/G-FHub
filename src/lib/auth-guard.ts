import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

export async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return { error: NextResponse.json({ error: "Non autenticato" }, { status: 401 }) };
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return { error: NextResponse.json({ error: "Accesso negato" }, { status: 403 }) };
    }

    return { user };
  } catch {
    return { error: NextResponse.json({ error: "Non autenticato" }, { status: 401 }) };
  }
}
