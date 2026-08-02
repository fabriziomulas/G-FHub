import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { generateReferralCode } from "@/lib/referral";

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

// GET /api/user/referral -> codice di invito dell'utente (lo genera se non esiste ancora,
// per gli account creati prima dell'introduzione del programma referral) + quante persone ha invitato
export async function GET(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  if (!user.referralCode) {
    let referralCode = generateReferralCode();
    while (await prisma.user.findUnique({ where: { referralCode } })) {
      referralCode = generateReferralCode();
    }
    user = await prisma.user.update({ where: { id: userId }, data: { referralCode } });
  }

  const referralsCount = await prisma.user.count({ where: { referredById: userId } });
  const rewardedCount = await prisma.user.count({ where: { referredById: userId, referralRewarded: true } });

  return NextResponse.json({
    referralCode: user.referralCode,
    referralsCount,
    rewardedCount,
  });
}
