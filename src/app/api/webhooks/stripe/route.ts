import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { calculateXp, getLevel, LEVEL_COUPONS } from "@/lib/levels";
import { REFERRAL_REWARD_DISCOUNT, REFERRAL_MILESTONE_COUNT, REFERRAL_MILESTONE_DISCOUNT, referralCouponExpiry } from "@/lib/referral";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);
const ORDER_NOTIFY_EMAIL = process.env.ORDER_NOTIFY_EMAIL || "g.f.hub0@gmail.com";

function generateCode(): string {
  return "SL-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

interface ResolvedItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
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

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "checkout.session.expired":
      await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;
    case "charge.refunded":
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Idempotenza: Stripe può reinviare lo stesso evento più volte
  const existingOrder = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
  });
  if (existingOrder) {
    return;
  }

  {
    const total = (session.amount_total || 0) / 100;
    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
    const customerName = session.customer_details?.name || "";
    const customerEmail = session.customer_details?.email || "";
    const address = session.customer_details?.address;
    const customerAddress = address
      ? `${address.line1 || ""}, ${address.postal_code || ""} ${address.city || ""}, ${address.country || ""}`
      : "";

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
    });

    // Abbina ogni riga al prodotto reale tramite l'ID salvato nei metadata
    // (non per titolo, che può essere duplicato o cambiare dopo l'acquisto)
    const resolvedItems: ResolvedItem[] = [];
    for (const item of lineItems.data) {
      const product = item.price?.product;
      const productId =
        product && typeof product !== "string" && !("deleted" in product && product.deleted)
          ? (product as Stripe.Product).metadata?.productId
          : undefined;

      if (!productId) continue;

      const dbProduct = await prisma.product.findUnique({ where: { id: productId } });
      if (!dbProduct) continue;

      resolvedItems.push({
        productId,
        title: item.description || dbProduct.title,
        quantity: item.quantity || 0,
        price: (item.amount_total || 0) / 100,
      });
    }

    const user = customerEmail
      ? await prisma.user.findUnique({ where: { email: customerEmail } })
      : null;

    const giftWrap = session.metadata?.giftWrap === "true";
    const giftMessage = session.metadata?.giftMessage || null;

    await prisma.$transaction(async (tx) => {
      await tx.order.create({
        data: {
          stripeSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
          status: "PAID",
          total,
          customerName,
          customerEmail,
          customerAddress,
          giftWrap,
          giftMessage,
          userId: user?.id,
          items: {
            create: resolvedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      for (const item of resolvedItems) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;
        const newStock = Math.max(0, product.stock - item.quantity);
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newStock, inStock: newStock > 0 },
        });
      }
    });

    // Il coupon eventualmente applicato al checkout diventa "used" solo ora,
    // a pagamento confermato — non prima (evita che un checkout abbandonato
    // o fallito bruci comunque il coupon). couponUserId è una verifica in più
    // contro un metadata manomesso: deve combaciare con chi lo ha creato.
    const redeemedCouponCode = session.metadata?.couponCode;
    const redeemedCouponUserId = session.metadata?.couponUserId;
    if (redeemedCouponCode && redeemedCouponUserId) {
      await prisma.coupon.updateMany({
        where: { code: redeemedCouponCode, userId: redeemedCouponUserId, used: false },
        data: { used: true },
      });
    }

    let couponCode: string | null = null;
    let newLevelName: string | null = null;

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
        couponCode = generateCode();
        newLevelName = newLevel.name;
        await prisma.coupon.create({
          data: {
            code: couponCode,
            userId: user.id,
            discount: couponConfig.discount,
            minSpent: couponConfig.minSpent,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }

      // Ricompensa a chi ha invitato: al massimo 2 coupon in tutta la vita del
      // referrer, non uno per ogni amico. Il primo amico pagante sblocca un
      // coupon "di benvenuto" al programma; il decimo amico pagante sblocca
      // un coupon più alto come traguardo. Gli amici dal 2° al 9° (e dall'11°
      // in poi) fanno comunque salire il conteggio ma non generano coupon.
      if (user.referredById && !user.referralRewarded) {
        const referrer = await prisma.user.findUnique({ where: { id: user.referredById } });
        if (referrer) {
          const priorRewardedReferrals = await prisma.user.count({
            where: { referredById: referrer.id, referralRewarded: true },
          });
          const referralOrdinal = priorRewardedReferrals + 1;
          const isFirstReferral = referralOrdinal === 1;
          const isMilestoneReferral = referralOrdinal === REFERRAL_MILESTONE_COUNT;

          if (isFirstReferral || isMilestoneReferral) {
            const rewardDiscount = isMilestoneReferral ? REFERRAL_MILESTONE_DISCOUNT : REFERRAL_REWARD_DISCOUNT;

            await prisma.$transaction([
              prisma.coupon.create({
                data: {
                  code: generateCode(),
                  userId: referrer.id,
                  discount: rewardDiscount,
                  expiresAt: referralCouponExpiry(),
                },
              }),
              prisma.user.update({ where: { id: user.id }, data: { referralRewarded: true } }),
            ]);

            if (referrer.email) {
              try {
                const introText = isMilestoneReferral
                  ? `Hai raggiunto 10 amici che hanno completato un ordine grazie al tuo invito! Come ringraziamento, trovi un coupon del ${rewardDiscount}%`
                  : `Una persona che hai invitato ha appena completato il suo primo ordine. Come ringraziamento, trovi un coupon del ${rewardDiscount}%`;
                await resend.emails.send({
                  from: "G&F Hub <noreply@gfhubs.com>",
                  to: referrer.email,
                  subject: isMilestoneReferral ? "Hai raggiunto 10 amici invitati 🎉" : "Il tuo invito ha portato un nuovo ordine 🎉",
                  html: `
                    <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', Arial, sans-serif; background-color: #0C0A09; color: #F4F5F6; border-radius: 16px; text-align: center;">
                      <img src="${process.env.NEXTAUTH_URL}/brand/logo-full.png" alt="G&F Hub" width="150" style="display: block; margin: 0 auto 16px; height: auto;" />
                      <p style="font-size: 15px; margin-bottom: 24px; color: #A0A0A0;">
                        ${introText} nella tua area account, valido 30 giorni.
                      </p>
                      <a href="${process.env.NEXTAUTH_URL}/account" style="display: inline-block; background-color: #B2B395; color: #0C0A09; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">Vai al tuo account</a>
                      <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
                      <p style="font-size: 11px; color: #444;">© ${new Date().getFullYear()} G&F Hub. Tutti i diritti riservati.</p>
                    </div>
                  `,
                });
              } catch (err) {
                console.error("REFERRAL REWARD EMAIL ERROR:", err);
              }
            }
          } else {
            // Amico pagante che non è né il primo né il decimo: si conta ma non genera coupon.
            await prisma.user.update({ where: { id: user.id }, data: { referralRewarded: true } });
          }
        }
      }
    }

    await sendOrderEmails({
      total,
      customerName,
      customerEmail,
      customerAddress,
      items: resolvedItems,
      couponCode,
      newLevelName,
    });
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email;
  if (!email) return;

  try {
    await resend.emails.send({
      from: "G&F Hub <noreply@gfhubs.com>",
      to: email,
      subject: "Hai lasciato qualcosa nel carrello",
      html: `
        <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', Arial, sans-serif; background-color: #0C0A09; color: #F4F5F6; border-radius: 16px; text-align: center;">
          <img src="${process.env.NEXTAUTH_URL}/brand/logo-full.png" alt="G&F Hub" width="150" style="display: block; margin: 0 auto 16px; height: auto;" />
          <p style="font-size: 15px; margin-bottom: 24px; color: #A0A0A0;">
            Il pagamento non è stato completato e i prodotti sono ancora nel tuo carrello. Torna quando vuoi per finalizzare l&apos;ordine.
          </p>
          <a href="${process.env.NEXTAUTH_URL}/cart" style="display: inline-block; background-color: #B2B395; color: #0C0A09; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">Torna al carrello</a>
          <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
          <p style="font-size: 11px; color: #444;">© ${new Date().getFullYear()} G&F Hub. Tutti i diritti riservati.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("CART RECOVERY EMAIL ERROR:", error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const email = paymentIntent.receipt_email;
  if (!email) return;

  try {
    await resend.emails.send({
      from: "G&F Hub <noreply@gfhubs.com>",
      to: email,
      subject: "Il tuo pagamento non è andato a buon fine",
      html: `
        <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', Arial, sans-serif; background-color: #0C0A09; color: #F4F5F6; border-radius: 16px; text-align: center;">
          <img src="${process.env.NEXTAUTH_URL}/brand/logo-full.png" alt="G&F Hub" width="150" style="display: block; margin: 0 auto 16px; height: auto;" />
          <p style="font-size: 15px; margin-bottom: 24px; color: #A0A0A0;">
            Il pagamento del tuo ordine non è andato a buon fine. Nessun addebito è stato effettuato. Puoi riprovare in qualsiasi momento dal tuo carrello.
          </p>
          <a href="${process.env.NEXTAUTH_URL}/cart" style="display: inline-block; background-color: #B2B395; color: #0C0A09; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">Riprova il pagamento</a>
          <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
          <p style="font-size: 11px; color: #444;">© ${new Date().getFullYear()} G&F Hub. Tutti i diritti riservati.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("PAYMENT FAILED EMAIL ERROR:", error);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntentId) return;

  const order = await prisma.order.findUnique({ where: { stripePaymentIntentId: paymentIntentId } });
  if (!order || order.status === "REFUNDED") return;

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "REFUNDED" },
  });

  if (order.customerEmail) {
    try {
      await resend.emails.send({
        from: "G&F Hub <noreply@gfhubs.com>",
        to: order.customerEmail,
        subject: "Il tuo rimborso è stato elaborato",
        html: `
          <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', Arial, sans-serif; background-color: #0C0A09; color: #F4F5F6; border-radius: 16px; text-align: center;">
            <img src="${process.env.NEXTAUTH_URL}/brand/logo-full.png" alt="G&F Hub" width="150" style="display: block; margin: 0 auto 16px; height: auto;" />
            <p style="font-size: 16px; margin-bottom: 8px; color: #F4F5F6;">Ciao ${order.customerName || ""},</p>
            <p style="font-size: 14px; margin-bottom: 24px; color: #A0A0A0;">
              Il rimborso per l'ordine <strong style="color:#F4F5F6;">#${order.id.slice(0, 8)}</strong> di
              <strong style="color:#F4F5F6;">€${order.total.toFixed(2)}</strong> è stato elaborato. L'importo tornerà
              sul tuo metodo di pagamento originale entro qualche giorno lavorativo, a seconda della tua banca.
            </p>
            <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
            <p style="font-size: 11px; color: #444;">© ${new Date().getFullYear()} G&F Hub. Tutti i diritti riservati.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("REFUND EMAIL ERROR:", err);
    }
  }
}

async function sendOrderEmails(data: {
  total: number;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  items: ResolvedItem[];
  couponCode: string | null;
  newLevelName: string | null;
}) {
  const { total, customerName, customerEmail, customerAddress, items, couponCode, newLevelName } = data;

  const itemsHtml = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;color:#F4F5F6;">${i.quantity}x ${escapeHtml(i.title)}</td><td style="padding:6px 0;color:#F4F5F6;text-align:right;">€${i.price.toFixed(2)}</td></tr>`
    )
    .join("");

  try {
    if (customerEmail) {
      await resend.emails.send({
        from: "G&F Hub <noreply@gfhubs.com>",
        to: customerEmail,
        subject: "Conferma del tuo ordine G&F Hub",
        html: `
          <div style="max-width: 520px; margin: 0 auto; padding: 32px; font-family: 'Inter', Arial, sans-serif; background-color: #0C0A09; color: #F4F5F6; border-radius: 16px;">
            <img src="${process.env.NEXTAUTH_URL}/brand/logo-full.png" alt="G&F Hub" width="130" style="display: block; margin: 0 0 12px; height: auto;" />
            <p style="font-size: 15px; color: #A0A0A0; margin-bottom: 24px;">Grazie ${escapeHtml(customerName || "")}, il tuo ordine è confermato.</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">${itemsHtml}</table>
            <div style="border-top: 1px solid #222; padding-top: 12px; display: flex; justify-content: space-between; font-weight: 600;">
              <span>Totale</span><span>€${total.toFixed(2)}</span>
            </div>
            ${customerAddress ? `<p style="font-size: 13px; color: #A0A0A0; margin-top: 20px;">Spedizione a: ${escapeHtml(customerAddress)}</p>` : ""}
            ${
              couponCode
                ? `<div style="margin-top: 24px; padding: 16px; background: rgba(178,179,149,0.1); border: 1px solid rgba(178,179,149,0.3); border-radius: 12px;">
                     <p style="font-size: 13px; color: #B2B395; margin: 0 0 4px;">🎉 Sei salito al livello ${escapeHtml(newLevelName || "")}!</p>
                     <p style="font-size: 13px; color: #F4F5F6; margin: 0;">Hai ricevuto il codice sconto <strong>${escapeHtml(couponCode)}</strong>, valido 30 giorni.</p>
                   </div>`
                : ""
            }
            <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
            <p style="font-size: 11px; color: #444;">© ${new Date().getFullYear()} G&F Hub. Tutti i diritti riservati.</p>
          </div>
        `,
      });
    }

    await resend.emails.send({
      from: "G&F Hub <noreply@gfhubs.com>",
      to: ORDER_NOTIFY_EMAIL,
      subject: `Nuovo ordine ricevuto — €${total.toFixed(2)}`,
      html: `
        <div style="max-width: 520px; margin: 0 auto; padding: 32px; font-family: 'Inter', Arial, sans-serif; background-color: #0C0A09; color: #F4F5F6; border-radius: 16px;">
          <h1 style="color: #B2B395; font-size: 20px; margin-bottom: 20px;">Nuovo ordine pagato</h1>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #A0A0A0; width: 120px;">Cliente</td><td style="padding: 6px 0;">${escapeHtml(customerName || "N/D")}</td></tr>
            <tr><td style="padding: 6px 0; color: #A0A0A0;">Email</td><td style="padding: 6px 0;">${escapeHtml(customerEmail || "N/D")}</td></tr>
            <tr><td style="padding: 6px 0; color: #A0A0A0;">Indirizzo</td><td style="padding: 6px 0;">${escapeHtml(customerAddress || "N/D")}</td></tr>
          </table>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 16px;">${itemsHtml}</table>
          <div style="border-top: 1px solid #222; padding-top: 12px; margin-top: 8px; display: flex; justify-content: space-between; font-weight: 600;">
            <span>Totale</span><span>€${total.toFixed(2)}</span>
          </div>
          <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
          <p style="font-size: 11px; color: #444;">Gestisci l'ordine dal pannello /admin.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("ORDER EMAIL ERROR:", error);
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
