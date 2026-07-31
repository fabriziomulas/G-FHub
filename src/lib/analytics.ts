declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const META_EVENT_MAP: Record<string, string> = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
};

export function trackEvent(gaEventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  window.gtag?.("event", gaEventName, params);

  const metaEvent = META_EVENT_MAP[gaEventName];
  if (metaEvent) window.fbq?.("track", metaEvent, params);
}
