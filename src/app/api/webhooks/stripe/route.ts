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
    const customerName = session.customer_details?.name || "";
    const customerEmail = session.customer_details?.email || "";
    const address = session.customer_details?.address;
    const customerAddress = address
      ? `${address.line1 || ""}, ${address.postal_code || ""} ${address.city || ""}, ${address.country || ""}`
      : "";

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    // Salva ordine con dati cliente
    const orderId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "Order" (id, status, total, "customerName", "customerEmail", "customerAddress", "createdAt", "updatedAt")
      VALUES (${orderId}, 'PAID', ${total}, ${customerName}, ${customerEmail}, ${customerAddress}, NOW(), NOW())
    `;

    // Salva OrderItems e scala stock
    for (const item of lineItems.data) {
      const productName = item.description || "";
      const quantity = item.quantity || 0;
      const price = (item.amount_total || 0) / 100;

      if (productName && quantity > 0) {
        const product = await prisma.product.findFirst({
          where: { title: productName },
        });

        if (product) {
          await prisma.$executeRaw`
            INSERT INTO "OrderItem" (id, "orderId", "productId", quantity, price)
            VALUES (${crypto.randomUUID()}, ${orderId}, ${product.id}, ${quantity}, ${price})
          `;

          const newStock = Math.max(0, product.stock - quantity);
          await prisma.product.update({
            where: { id: product.id },
            data: { stock: newStock, inStock: newStock > 0 },
          });
        }
      }
    }

    if (customerEmail) {
      const user = await prisma.user.findUnique({ where: { email: customerEmail } });
      if (user) {
        const xpGained = calculateXp(total);
        const newXp = user.xp + xpGained;
        const oldLevel = getLevel(user.xp);
        const newLevel = getLevel(newXp);
        const pointsGained = Math.round(total * newLevel.pointsMultiplier);

        await prisma.user.update({
          where: { id: user.id },
          data: { xp: newXp, level: newLevel.name, points: user.points + pointsGained },
        });

        if (oldLevel.name !== newLevel.name && LEVEL_COUPONS[newLevel.name]) {
          const couponConfig = LEVEL_COUPONS[newLevel.name];
          await prisma.coupon.create({
            data: {
              code: generateCode(),
              userId: user.id,
              discount: couponConfig.discount,
              minSpent: couponConfig.minSpent,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}