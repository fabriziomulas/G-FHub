import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json([]);

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const coupons = await prisma.coupon.findMany({
      where: { userId: payload.id as string },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(coupons);
  } catch {
    return NextResponse.json([]);
  }
}