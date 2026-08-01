import { routing } from "@/i18n/routing";

export const SITE_URL = (process.env.NEXTAUTH_URL || "https://www.gfhubs.com").replace(/\/$/, "");
export const SITE_NAME = "G&F Hub";

/** Path for a given locale under next-intl's "as-needed" prefix scheme (default locale unprefixed). */
export function localizedPath(locale: string, pathname: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const suffix = pathname === "/" ? "" : pathname;
  return `${prefix}${suffix}` || "/";
}

/** hreflang alternates for every supported locale plus x-default, keyed for Next's `alternates.languages`. */
export function buildLanguageAlternates(pathname: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${SITE_URL}${localizedPath(locale, pathname)}`;
  }
  languages["x-default"] = `${SITE_URL}${pathname === "/" ? "" : pathname}`;
  return languages;
}

export function canonicalFor(locale: string, pathname: string): string {
  return `${SITE_URL}${localizedPath(locale, pathname)}`;
}

/** robots directive for pages that must never be indexed (admin, account, auth, cart). */
export const NOINDEX = { index: false, follow: false };
