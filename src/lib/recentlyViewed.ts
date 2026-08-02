const STORAGE_KEY = "gfhub_recently_viewed";
const MAX_ITEMS = 8;

export function addRecentlyViewed(productId: string) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentlyViewedIds().filter((id) => id !== productId);
    const updated = [productId, ...existing].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage non disponibile (modalità privata, quota piena, ecc.) — non bloccante
  }
}

export function getRecentlyViewedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
