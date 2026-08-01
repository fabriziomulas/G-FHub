import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { SignJWT, jwtVerify } from "jose";

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

export async function POST(request: Request) {
  const { email } = await request.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: "Email già verificata" }, { status: 400 });
  }

  const token = await new SignJWT({ id: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;

  await resend.emails.send({
    from: "G&F Hub <noreply@gfhubs.com>",
    to: email,
    subject: "Verifica il tuo account G&F Hub",
    html: `
      <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', Arial, sans-serif; background-color: #0C0A09; color: #F4F5F6; border-radius: 16px; text-align: center;">
        <img src="${process.env.NEXTAUTH_URL}/brand/logo-full.png" alt="G&F Hub" width="150" style="display: block; margin: 0 auto 16px; height: auto;" />
        <p style="font-size: 16px; margin-bottom: 24px; color: #A0A0A0;">Benvenuto! Clicca qui per verificare il tuo account.</p>
        <a href="${verifyUrl}" style="display: inline-block; background-color: #B2B395; color: #0C0A09; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">Verifica Email</a>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/auth/verify?status=error&message=Token mancante", process.env.NEXTAUTH_URL)
    );
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    await prisma.user.update({
      where: { id: payload.id as string },
      data: { emailVerified: true },
    });

    return NextResponse.redirect(
      new URL("/auth/verify?status=success", process.env.NEXTAUTH_URL)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/auth/verify?status=error&message=Token scaduto o non valido", process.env.NEXTAUTH_URL)
    );
  }
}