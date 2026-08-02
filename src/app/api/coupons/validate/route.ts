import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

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

// POST /api/coupons/validate -> verifica se un codice sconto è utilizzabile dall'utente loggato,
// per l'importo attuale del carrello. Non consuma il coupon (succede solo a pagamento riuscito).
export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ valid: false, error: "Accedi al tuo account per usare un coupon" }, { status: 401 });
  }

  const { code, subtotal } = await request.json();
  if (!code) {
    return NextResponse.json({ valid: false, error: "Codice mancante" }, { status: 400 });
  }

  const coupon = await prisma.coupon.findUnique({ where: { code: String(code).trim().toUpperCase() } });

  if (!coupon || coupon.userId !== userId) {
    return NextResponse.json({ valid: false, error: "Codice non valido" }, { status: 404 });
  }
  if (coupon.used) {
    return NextResponse.json({ valid: false, error: "Questo coupon è già stato utilizzato" }, { status: 400 });
  }
  if (coupon.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, error: "Questo coupon è scaduto" }, { status: 400 });
  }
  if (coupon.minSpent && typeof subtotal === "number" && subtotal < coupon.minSpent) {
    return NextResponse.json(
      { valid: false, error: `Serve un carrello di almeno €${coupon.minSpent.toFixed(2)} per usare questo coupon` },
      { status: 400 }
    );
  }

  return NextResponse.json({ valid: true, code: coupon.code, discount: coupon.discount });
}
