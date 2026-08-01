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
    include: { items: { include: { product: { select: { handle: true, title: true } } } } },
  });

  if (status === "SHIPPED" && order.customerEmail) {
    try {
      await resend.emails.send({
        from: "G&F Hub <noreply@gfhubs.com>",
        to: order.customerEmail,
        subject: "Il tuo ordine G&F Hub è in viaggio",
        html: `
          <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', Arial, sans-serif; background-color: #0C0A09; color: #F4F5F6; border-radius: 16px; text-align: center;">
            <img src="${process.env.NEXTAUTH_URL}/brand/logo-full.png" alt="G&F Hub" width="150" style="display: block; margin: 0 auto 16px; height: auto;" />
            <p style="font-size: 16px; margin-bottom: 8px; color: #F4F5F6;">Ciao ${order.customerName || ""},</p>
            <p style="font-size: 14px; margin-bottom: 24px; color: #A0A0A0;">
              Il tuo ordine <strong style="color:#F4F5F6;">#${order.id.slice(0, 8)}</strong> è stato spedito ed è in viaggio verso di te.
            </p>
            <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
            <p style="font-size: 11px; color: #444;">© ${new Date().getFullYear()} G&F Hub. Tutti i diritti riservati.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("SHIPPED EMAIL ERROR:", err);
    }
  }

  if (status === "DELIVERED" && order.customerEmail) {
    try {
      const firstProduct = order.items[0]?.product;
      const reviewUrl = firstProduct
        ? `${process.env.NEXTAUTH_URL}/product/${firstProduct.handle}?review=1`
        : `${process.env.NEXTAUTH_URL}/shop`;

      await resend.emails.send({
        from: "G&F Hub <noreply@gfhubs.com>",
        to: order.customerEmail,
        subject: "Com'è il tuo nuovo gioiello?",
        html: `
          <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', Arial, sans-serif; background-color: #0C0A09; color: #F4F5F6; border-radius: 16px; text-align: center;">
            <img src="${process.env.NEXTAUTH_URL}/brand/logo-full.png" alt="G&F Hub" width="150" style="display: block; margin: 0 auto 16px; height: auto;" />
            <p style="font-size: 16px; margin-bottom: 8px; color: #F4F5F6;">Ciao ${order.customerName || ""},</p>
            <p style="font-size: 14px; margin-bottom: 24px; color: #A0A0A0;">
              Il tuo ordine <strong style="color:#F4F5F6;">#${order.id.slice(0, 8)}</strong> dovrebbe essere arrivato. Raccontaci
              com'è andata: bastano due minuti, e aiuta chi deve ancora scegliere.
            </p>
            <a href="${reviewUrl}" style="display: inline-block; background-color: #B2B395; color: #0C0A09; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">Lascia una recensione</a>
            <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
            <p style="font-size: 11px; color: #444;">© ${new Date().getFullYear()} G&F Hub. Tutti i diritti riservati.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("DELIVERED EMAIL ERROR:", err);
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
