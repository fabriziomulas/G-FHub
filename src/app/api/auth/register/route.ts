import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { SignJWT } from "jose";
import { generateReferralCode, REFERRAL_WELCOME_DISCOUNT, referralCouponExpiry } from "@/lib/referral";

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

function generateCouponCode(): string {
  return "SL-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, ref } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email e password obbligatorie" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email già registrata" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const referrer = ref ? await prisma.user.findUnique({ where: { referralCode: ref } }) : null;

    let referralCode = generateReferralCode();
    // Collisione estremamente improbabile (spazio di ~2 miliardi di codici), ma la evitiamo comunque.
    while (await prisma.user.findUnique({ where: { referralCode } })) {
      referralCode = generateReferralCode();
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        emailVerified: false,
        referralCode,
        referredById: referrer?.id,
      },
    });

    if (referrer) {
      await prisma.coupon.create({
        data: {
          code: generateCouponCode(),
          userId: user.id,
          discount: REFERRAL_WELCOME_DISCOUNT,
          expiresAt: referralCouponExpiry(),
        },
      });
    }

    const verifyToken = await new SignJWT({ id: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${verifyToken}`;

    await resend.emails.send({
      from: "G&F Hub <noreply@gfhubs.com>",
      to: email,
      subject: "Verifica il tuo account G&F Hub",
      html: `
        <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', Arial, sans-serif; background-color: #0C0A09; color: #F4F5F6; border-radius: 16px; text-align: center;">
          <img src="${process.env.NEXTAUTH_URL}/brand/logo-full.png" alt="G&F Hub" width="150" style="display: block; margin: 0 auto 16px; height: auto;" />
          <p style="font-size: 16px; margin-bottom: 24px; color: #A0A0A0;">Benvenuto! Conferma la tua email per attivare l'account.</p>
          <a href="${verifyUrl}" style="display: inline-block; background-color: #B2B395; color: #0C0A09; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">Verifica Email</a>
          <p style="font-size: 12px; color: #666; margin-top: 24px;">Se non hai richiesto questo account, ignora questa email.</p>
          <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
          <p style="font-size: 11px; color: #444;">© ${new Date().getFullYear()} G&F Hub. Tutti i diritti riservati.</p>
        </div>
      `,
    });

    // 
    return NextResponse.json({ 
      success: true, 
      message: "Controlla la tua email per verificare l'account (controlla anche nella cartella spam / promozioni)" 
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}