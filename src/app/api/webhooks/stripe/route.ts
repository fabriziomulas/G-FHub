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

    console.log("=== NUOVO ORDINE ===");
    console.log("Email Stripe:", userEmail);
    console.log("Totale:", total);

    // Salva ordine
    await prisma.$executeRaw`
      INSERT INTO "Order" (id, status, total, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'PAID', ${total}, NOW(), NOW())
    `;

    if (userEmail) {
      const user = await prisma.user.findUnique({ where: { email: userEmail } });
      
      if (user) {
        console.log("Utente trovato:", user.email, "XP attuali:", user.xp, "Livello:", user.level);

        const xpGained = calculateXp(total);
        const newXp = user.xp + xpGained;
        const oldLevel = getLevel(user.xp);
        const newLevel = getLevel(newXp);
        const pointsGained = Math.round(total * newLevel.pointsMultiplier);

        console.log("XP guadagnati:", xpGained, "Nuovo XP:", newXp);
        console.log("Vecchio livello:", oldLevel.name, "Nuovo livello:", newLevel.name);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            xp: newXp,
            level: newLevel.name,
            points: user.points + pointsGained,
          },
        });

        if (oldLevel.name !== newLevel.name && LEVEL_COUPONS[newLevel.name]) {
          const couponConfig = LEVEL_COUPONS[newLevel.name];
          const code = generateCode();
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);

          console.log("CREAZIONE COUPON:", code, "Sconto:", couponConfig.discount, "€");

          await prisma.coupon.create({
            data: {
              code,
              userId: user.id,
              discount: couponConfig.discount,
              minSpent: couponConfig.minSpent,
              expiresAt,
            },
          });
        } else if (oldLevel.name === newLevel.name) {
          console.log("Nessun cambio livello, no coupon");
        }
      } else {
        console.log("UTENTE NON TROVATO per email:", userEmail);
      }
    } else {
      console.log("Nessuna email nel pagamento Stripe");
    }
  }

  return NextResponse.json({ received: true });
}