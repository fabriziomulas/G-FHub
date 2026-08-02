import { NextResponse } from "next/server";
import Stripe from "stripe";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

async function getUserId(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  if (!match) return null;
  try {
    const { payload } = await jwtVerify(decodeURIComponent(match[1]), JWT_SECRET);
    return payload.id as string;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { items, customer, gift, couponCode } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Carrello vuoto" }, { status: 400 });
    }

    const lineItems = items.map((item: { id: string; title: string; price: number; quantity: number; image?: string }) => {
      const productData: { name: string; images?: string[]; metadata?: Record<string, string> } = { name: item.title };
      if (item.image) productData.images = [item.image];
      if (item.id) productData.metadata = { productId: item.id };
      return {
        price_data: {
          currency: "eur",
          product_data: productData,
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card", "klarna"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
      shipping_address_collection: { allowed_countries: ["IT"] },
    };

    if (customer?.email) {
      sessionConfig.customer_email = customer.email;
    }

    const metadata: Record<string, string> = {};

    if (gift?.wrap) {
      metadata.giftWrap = "true";
      metadata.giftMessage = typeof gift.message === "string" ? gift.message.slice(0, 300) : "";
    }

    // Il coupon non viene mai fidato dal client: si rivalida qui, sullo stesso
    // utente autenticato dal cookie, esattamente come in /api/coupons/validate.
    // Resta "used: false" finché il pagamento non va davvero a buon fine — lo
    // segna il webhook di Stripe, mai questa route.
    if (couponCode) {
      const userId = await getUserId(request);
      const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);

      if (userId) {
        const coupon = await prisma.coupon.findUnique({ where: { code: String(couponCode).trim().toUpperCase() } });
        const isValid =
          coupon &&
          coupon.userId === userId &&
          !coupon.used &&
          coupon.expiresAt > new Date() &&
          (!coupon.minSpent || subtotal >= coupon.minSpent);

        if (isValid && coupon) {
          const stripeCoupon = await stripe.coupons.create({
            percent_off: coupon.discount,
            duration: "once",
            name: coupon.code,
          });
          sessionConfig.discounts = [{ coupon: stripeCoupon.id }];
          metadata.couponCode = coupon.code;
          metadata.couponUserId = userId;
        }
      }
    }

    if (Object.keys(metadata).length > 0) {
      sessionConfig.metadata = metadata;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json({ error: "Errore checkout" }, { status: 500 });
  }
}
