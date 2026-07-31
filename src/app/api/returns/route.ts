import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const RETURNS_EMAIL = process.env.RETURNS_EMAIL || "info@gfhubs.com";

const REASON_LABELS: Record<string, string> = {
  defective: "Prodotto difettoso o danneggiato",
  not_as_described: "Non corrisponde alla descrizione",
  wrong_item: "Ricevuto articolo sbagliato",
  changed_mind: "Ripensamento / non più necessario",
  size: "Taglia o misura errata",
  other: "Altro",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, name, email, product, reason, details } = body;

    if (!name || !email || !orderNumber || !product || !reason) {
      return NextResponse.json({ error: "Compila tutti i campi obbligatori" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email)) {
      return NextResponse.json({ error: "Email non valida" }, { status: 400 });
    }

    const reasonLabel = REASON_LABELS[reason] || reason;

    await resend.emails.send({
      from: "Storeluxe <noreply@gfhubs.com>",
      to: RETURNS_EMAIL,
      replyTo: email,
      subject: `Richiesta di reso — Ordine ${orderNumber}`,
      html: `
        <div style="max-width: 560px; margin: 0 auto; padding: 32px; font-family: 'Inter', Arial, sans-serif; background-color: #0C0A09; color: #F4F5F6; border-radius: 16px;">
          <h1 style="color: #B2B395; font-size: 20px; margin-bottom: 24px;">Nuova richiesta di reso</h1>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #A0A0A0; width: 140px;">Numero ordine</td><td style="padding: 8px 0;">${escapeHtml(orderNumber)}</td></tr>
            <tr><td style="padding: 8px 0; color: #A0A0A0;">Cliente</td><td style="padding: 8px 0;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding: 8px 0; color: #A0A0A0;">Email</td><td style="padding: 8px 0;">${escapeHtml(email)}</td></tr>
            <tr><td style="padding: 8px 0; color: #A0A0A0;">Prodotto</td><td style="padding: 8px 0;">${escapeHtml(product)}</td></tr>
            <tr><td style="padding: 8px 0; color: #A0A0A0; vertical-align: top;">Motivazione</td><td style="padding: 8px 0;">${escapeHtml(reasonLabel)}</td></tr>
          </table>
          ${details ? `<div style="margin-top: 20px;"><p style="color: #A0A0A0; font-size: 13px; margin-bottom: 6px;">Dettagli aggiuntivi</p><p style="font-size: 14px; line-height: 1.6; white-space: pre-line;">${escapeHtml(details)}</p></div>` : ""}
          <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
          <p style="font-size: 11px; color: #444;">Richiesta inviata dal form resi del sito Storeluxe.</p>
        </div>
      `,
    });

    await resend.emails.send({
      from: "Storeluxe <noreply@gfhubs.com>",
      to: email,
      subject: "Abbiamo ricevuto la tua richiesta di reso",
      html: `
        <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', Arial, sans-serif; background-color: #0C0A09; color: #F4F5F6; border-radius: 16px; text-align: center;">
          <h1 style="color: #B2B395; font-size: 24px; margin-bottom: 8px;">STORE<span style="color: #F4F5F6;">LUXE</span></h1>
          <p style="font-size: 16px; margin-bottom: 8px; color: #F4F5F6;">Ciao ${escapeHtml(name)},</p>
          <p style="font-size: 14px; margin-bottom: 24px; color: #A0A0A0;">
            Abbiamo ricevuto la tua richiesta di reso per l'ordine <strong style="color:#F4F5F6;">${escapeHtml(orderNumber)}</strong>.
            Il nostro team la esaminerà e ti risponderà via email entro 48 ore lavorative con le istruzioni per la spedizione.
          </p>
          <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
          <p style="font-size: 11px; color: #444;">© ${new Date().getFullYear()} Storeluxe. Tutti i diritti riservati.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RETURNS ERROR:", error);
    return NextResponse.json({ error: "Errore durante l'invio della richiesta" }, { status: 500 });
  }
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
