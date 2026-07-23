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
    from: "Storeluxe <noreply@gfhubs.com>",
    to: email,
    subject: "Verifica il tuo account Storeluxe",
    html: `<h1>Benvenuto su Storeluxe!</h1><p>Clicca qui per verificare il tuo account:</p><a href="${verifyUrl}">${verifyUrl}</a>`,
  });

  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token mancante" }, { status: 400 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    await prisma.user.update({
      where: { id: payload.id as string },
      data: { emailVerified: true },
    });

    return new Response("Email verificata! Torna al sito e fai login.", {
      headers: { "Content-Type": "text/html" },
    });
  } catch {
    return new Response("Token scaduto o non valido.", { status: 400 });
  }
}