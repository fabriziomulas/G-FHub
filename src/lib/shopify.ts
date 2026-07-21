import createClient from "shopify-buy";

const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!storeDomain || !storefrontAccessToken) {
  throw new Error("Variabili d'ambiente Shopify mancanti. Controlla .env.local");
}

export const shopifyClient = createClient({
  domain: storeDomain,
  storefrontAccessToken,
  apiVersion: "2024-10",
});