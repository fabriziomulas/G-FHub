import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { items, customer } = await request.json();

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

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json({ error: "Errore checkout" }, { status: 500 });
  }
}