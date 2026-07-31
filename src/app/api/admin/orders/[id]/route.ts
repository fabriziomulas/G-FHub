import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

const resend = new Resend(process.env.RESEND_API_KEY);

// PATCH -> aggiorna lo stato dell'ordine (es. segna come spedito)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  const order = await prisma.order.update({
    where: { id },
    data: { status },
  });

  if (status === "SHIPPED" && order.customerEmail) {
    try {
      await resend.emails.send({
        from: "Storeluxe <noreply@gfhubs.com>",
        to: order.customerEmail,
        subject: "Il tuo ordine Storeluxe è in viaggio",
        html: `
          <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', Arial, sans-serif; background-color: #0C0A09; color: #F4F5F6; border-radius: 16px; text-align: center;">
            <h1 style="color: #B2B395; font-size: 24px; margin-bottom: 8px;">STORE<span style="color: #F4F5F6;">LUXE</span></h1>
            <p style="font-size: 16px; margin-bottom: 8px; color: #F4F5F6;">Ciao ${order.customerName || ""},</p>
            <p style="font-size: 14px; margin-bottom: 24px; color: #A0A0A0;">
              Il tuo ordine <strong style="color:#F4F5F6;">#${order.id.slice(0, 8)}</strong> è stato spedito ed è in viaggio verso di te.
            </p>
            <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
            <p style="font-size: 11px; color: #444;">© ${new Date().getFullYear()} Storeluxe. Tutti i diritti riservati.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("SHIPPED EMAIL ERROR:", err);
    }
  }

  return NextResponse.json(order);
}

// DELETE -> elimina l'ordine (elimina anche i relativi OrderItem, grazie a onDelete: Cascade)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;

  await prisma.order.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
