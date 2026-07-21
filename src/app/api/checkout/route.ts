import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { items } = await request.json();
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

  if (!items?.length) {
    return NextResponse.json({ error: "Carrello vuoto" }, { status: 400 });
  }

  // Crea line items per Shopify
  const lineItems = items.map(
    (item: { variantId: string; quantity: number }) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    })
  );

  // Chiama Storefront API per creare il checkout
  const query = `
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          webUrl
        }
        checkoutUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const res = await fetch(
    `https://${domain}/api/2024-10/graphql.json`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { input: { lineItems } },
      }),
    }
  );

  const json = await res.json();
  const webUrl = json.data?.checkoutCreate?.checkout?.webUrl;

  if (!webUrl) {
    return NextResponse.json(
      { error: "Errore creazione checkout" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: webUrl });
}