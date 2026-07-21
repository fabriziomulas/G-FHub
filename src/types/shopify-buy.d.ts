declare module "shopify-buy" {
  export interface Client {
    product: {
      fetch(id: string): Promise<Product>;
      fetchAll(pageSize?: number): Promise<Product[]>;
      fetchByHandle(handle: string): Promise<Product>;
      fetchQuery(options: { query: string }): Promise<Product[]>;
    };
    collection: {
      fetchAll(): Promise<Collection[]>;
      fetchAllWithProducts(): Promise<Collection[]>;
      fetchByHandle(handle: string): Promise<Collection>;
      fetchWithProducts(id: string, options?: { productsFirst?: number }): Promise<Collection>;
    };
    checkout: {
      create(options?: {
        email?: string;
        lineItems?: Array<{ variantId: string; quantity: number }>;
      }): Promise<Cart>;
      fetch(id: string): Promise<Cart>;
      addLineItems(checkoutId: string, lineItems: Array<{ variantId: string; quantity: number }>): Promise<Cart>;
      updateLineItems(checkoutId: string, lineItems: Array<{ id: string; quantity: number }>): Promise<Cart>;
      removeLineItems(checkoutId: string, lineItemIds: string[]): Promise<Cart>;
      addDiscount(checkoutId: string, discountCode: string): Promise<Cart>;
      removeDiscount(checkoutId: string): Promise<Cart>;
    };
  }

  export interface Product {
    id: string;
    title: string;
    handle: string;
    description: string;
    descriptionHtml: string;
    availableForSale: boolean;
    createdAt: string;
    updatedAt: string;
    images: Image[];
    variants: Variant[];
    options: Option[];
    collections?: Collection[];
    media?: Media[];
    priceRange?: {
      minVariantPrice: { amount: number; currencyCode: string };
      maxVariantPrice: { amount: number; currencyCode: string };
    };
  }

  export interface Image {
    id: string;
    src: string;
    altText?: string;
    width?: number;
    height?: number;
  }

  export interface Variant {
    id: string;
    title: string;
    available: boolean;
    price: string;
    compareAtPrice?: string;
    selectedOptions: Array<{ name: string; value: string }>;
    image?: Image;
    product?: Product;
  }

  export interface Option {
    name: string;
    values: string[];
  }

  export interface Collection {
    id: string;
    title: string;
    handle: string;
    description: string;
    image?: Image;
    products?: Product[];
  }

  export interface Cart {
    id: string;
    webUrl: string;
    lineItems: LineItem[];
    totalPrice: string;
    subtotalPrice: string;
    totalTax: string;
    currencyCode: string;
    discount?: {
      code: string;
      amount: string;
    };
  }

  export interface LineItem {
    id: string;
    title: string;
    variant: Variant;
    quantity: number;
  }

  export interface Media {
    alt?: string;
    mediaContentType: string;
    image?: Image;
    sources?: Array<{ url: string; mimeType: string }>;
  }


  export function buildClient(config: {
    domain: string;
    storefrontAccessToken: string;
    apiVersion?: string;
  }): Client;

  export default buildClient;
}