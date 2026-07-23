import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { calculateXp, getLevel, LEVEL_COUPONS } from "@/lib/levels";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function generateCode(): string {
  return "SL-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch {
    return NextResponse.json({ error: "Firma non valida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const total = (session.amount_total || 0) / 100;
    const userEmail = session.customer_details?.email;

    // Salva ordine
    await prisma.$executeRaw`
      INSERT INTO "Order" (id, status, total, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'PAID', ${total}, NOW(), NOW())
    `;

    // Se abbiamo l'email, aggiorna XP e livello
    if (userEmail) {
      const user = await prisma.user.findUnique({ where: { email: userEmail } });
      if (user) {
        const xpGained = calculateXp(total);
        const newXp = user.xp + xpGained;
        const oldLevel = getLevel(user.xp);
        const newLevel = getLevel(newXp);
        const pointsGained = Math.round(total * newLevel.pointsMultiplier);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            xp: newXp,
            level: newLevel.name,
            points: user.points + pointsGained,
          },
        });

        // Se sale di livello, crea coupon
        if (oldLevel.name !== newLevel.name && LEVEL_COUPONS[newLevel.name]) {
          const couponConfig = LEVEL_COUPONS[newLevel.name];
          const code = generateCode();
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);

          await prisma.coupon.create({
            data: {
              code,
              userId: user.id,
              discount: couponConfig.discount,
              minSpent: couponConfig.minSpent,
              expiresAt,
            },
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}