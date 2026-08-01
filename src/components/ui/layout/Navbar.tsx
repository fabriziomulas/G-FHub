"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import NextLink from "next/link";
import { Menu, X, User, LogOut, ChevronDown, ShoppingBag, Heart, Globe } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCart } from "@/stores/cart";
import { useUser } from "@/hooks/useUser";
import { useWishlist } from "@/hooks/useWishlist";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = {
  it: "IT",
  en: "EN",
  es: "ES",
  fr: "FR",
};

export function Navbar() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const { totalItems } = useCart();
  const { user, logout } = useUser();
  const { items: wishlistItems } = useWishlist();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const itemCount = totalItems();
  const wishlistCount = wishlistItems.length;

  const navLinks = [
    { label: t("shop"), href: "/shop" },
    { label: t("new"), href: "/shop/new" },
    { label: t("bestSeller"), href: "/shop/best-seller" },
    { label: t("sale"), href: "/shop/offerte" },
    { label: t("chiSiamo"), href: "/chi-siamo" },
  ];

  const switchLocale = (newLocale: string) => {
    setLangOpen(false);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          "bg-background-primary/95 backdrop-blur-md border-b border-text-primary/10 py-4",
          scrolled && "shadow-sm"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center shrink-0 hover:opacity-80 transition-opacity">
            <span className="text-xl font-bold text-text-primary tracking-tight">
              G&amp;F HUB
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-text-primary/5 rounded-lg transition-all">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1 px-2.5 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-text-primary/5 rounded-lg transition-all">
                <Globe size={16} />
                {LOCALE_LABELS[locale]}
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-lg border border-text-primary/10 p-1 z-50">
                    {routing.locales.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => switchLocale(loc)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all w-full text-left",
                          loc === locale ? "text-accent-electric bg-text-primary/5" : "text-text-secondary hover:text-text-primary hover:bg-text-primary/5"
                        )}
                      >
                        {LOCALE_LABELS[loc]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user && (
              <Link href="/account/wishlist" className="relative p-2 text-text-secondary hover:text-accent-electric hover:bg-text-primary/5 rounded-lg transition-all">
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            <button onClick={() => setCartOpen(true)} className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-text-primary/5 rounded-lg transition-all">
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent-electric text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button onClick={() => setAccountOpen(!accountOpen)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-text-primary/5 rounded-lg transition-all">
                  <User size={16} />
                  <span className="max-w-25 truncate">{user.name || t("account")}</span>
                  <ChevronDown size={14} className={cn("transition-transform", accountOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {accountOpen && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-text-primary/10 p-1 z-50">
                      <div className="px-3 py-2 border-b border-text-primary/10 mb-1">
                        <p className="text-sm text-text-primary font-medium truncate">{user.email}</p>
                        <p className="text-xs text-accent-electric">{user.level}</p>
                      </div>
                      <Link href="/account" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-text-primary/5 rounded-lg transition-all w-full">
                        <User size={14} /> {t("dashboard")}
                      </Link>
                      <Link href="/account/wishlist" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-text-primary/5 rounded-lg transition-all w-full">
                        <Heart size={14} /> {t("favorites")} ({wishlistCount})
                      </Link>
                      {user.role === "ADMIN" && (
                        <NextLink href="/admin" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-accent-electric hover:text-accent-purple hover:bg-text-primary/5 rounded-lg transition-all w-full">
                          {t("admin")}
                        </NextLink>
                      )}
                      <button onClick={() => { setAccountOpen(false); logout(); }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-50 rounded-lg transition-all w-full mt-1">
                        <LogOut size={14} /> {t("logout")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/account/login" className="flex items-center gap-1.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-text-primary/5 rounded-lg transition-all">
                <User size={16} /> {t("login")}
              </Link>
            )}
          </div>

          <button className="md:hidden text-text-primary p-1" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-t border-text-primary/10 mt-3">
              <div className="px-6 py-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors py-2">{link.label}</Link>
                ))}
                <hr className="border-text-primary/10 my-2" />
                <div className="flex gap-2 py-2">
                  {routing.locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setMobileOpen(false); switchLocale(loc); }}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-lg border transition-all",
                        loc === locale ? "text-accent-electric border-accent-electric" : "text-text-secondary border-text-primary/10 hover:text-text-primary"
                      )}
                    >
                      {LOCALE_LABELS[loc]}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setMobileOpen(false); setCartOpen(true); }} className="text-text-secondary hover:text-text-primary py-2 text-left">{t("cart")} ({itemCount})</button>
                {user ? (
                  <>
                    <div className="py-2 text-sm text-text-muted">{user.email}</div>
                    <Link href="/account" onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-text-primary py-2">{t("dashboard")}</Link>
                    <Link href="/account/wishlist" onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-text-primary py-2">{t("favorites")} ({wishlistCount})</Link>
                    {user.role === "ADMIN" && <NextLink href="/admin" onClick={() => setMobileOpen(false)} className="text-accent-electric py-2">{t("admin")}</NextLink>}
                    <button onClick={() => { setMobileOpen(false); logout(); }} className="text-red-400 text-left py-2">{t("logout")}</button>
                  </>
                ) : (
                  <Link href="/account/login" onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-text-primary py-2">{t("login")}</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {accountOpen && <div className="fixed inset-0 z-30" onClick={() => setAccountOpen(false)} />}
      {langOpen && <div className="fixed inset-0 z-30" onClick={() => setLangOpen(false)} />}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
