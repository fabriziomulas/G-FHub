import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { SignJWT } from "jose";

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email e password obbligatorie" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email già registrata" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        emailVerified: false,
      },
    });

    const verifyToken = await new SignJWT({ id: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${verifyToken}`;

    await resend.emails.send({
      from: "Storeluxe <noreply@gfhubs.com>",
      to: email,
      subject: "Verifica il tuo account Storeluxe",
      html: `
        <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', Arial, sans-serif; background-color: #0C0A09; color: #F4F5F6; border-radius: 16px; text-align: center;">
          <h1 style="color: #B2B395; font-size: 24px; margin-bottom: 8px;">STORE<span style="color: #F4F5F6;">LUXE</span></h1>
          <p style="font-size: 16px; margin-bottom: 24px; color: #A0A0A0;">Benvenuto! Conferma la tua email per attivare l'account.</p>
          <a href="${verifyUrl}" style="display: inline-block; background-color: #B2B395; color: #0C0A09; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">Verifica Email</a>
          <p style="font-size: 12px; color: #666; margin-top: 24px;">Se non hai richiesto questo account, ignora questa email.</p>
          <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
          <p style="font-size: 11px; color: #444;">© ${new Date().getFullYear()} Storeluxe. Tutti i diritti riservati.</p>
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