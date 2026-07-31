import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

export const CHAT_TOOLS: Anthropic.Tool[] = [
  {
    name: "search_products",
    description:
      "Cerca prodotti nel catalogo G&F Hub per nome, descrizione o categoria. Usa questo strumento ogni volta che il cliente chiede informazioni su prodotti disponibili, prezzi o disponibilità — non inventare mai prodotti o prezzi.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Termine di ricerca, es. 'anello oro' o 'collana'",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_order_status",
    description:
      "Recupera lo stato di un ordine tramite email del cliente e numero d'ordine (le prime 8 cifre dell'ID ordine, presenti nell'email di conferma/spedizione). Usa questo strumento solo quando il cliente ha fornito ENTRAMBI email e numero ordine.",
    input_schema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Email usata per l'ordine" },
        orderNumber: { type: "string", description: "Numero ordine, es. le prime 8 cifre dell'ID" },
      },
      required: ["email", "orderNumber"],
    },
  },
];

export async function executeSearchProducts(query: string) {
  const products = await prisma.product.findMany({
    where: {
      inStock: true,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) {
    return { found: false, products: [] };
  }

  return {
    found: true,
    products: products.map((p) => ({
      title: p.title,
      price: p.price,
      handle: p.handle,
      inStock: p.inStock,
      stock: p.stock,
    })),
  };
}

export async function executeGetOrderStatus(email: string, orderNumber: string) {
  const order = await prisma.order.findFirst({
    where: {
      customerEmail: { equals: email, mode: "insensitive" },
      id: { startsWith: orderNumber },
    },
    include: {
      items: { include: { product: { select: { title: true } } } },
    },
  });

  if (!order) {
    return { found: false };
  }

  return {
    found: true,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((i) => ({ title: i.product.title, quantity: i.quantity })),
  };
}

export async function executeTool(name: string, input: Record<string, unknown>) {
  switch (name) {
    case "search_products":
      return executeSearchProducts(String(input.query || ""));
    case "get_order_status":
      return executeGetOrderStatus(String(input.email || ""), String(input.orderNumber || ""));
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
