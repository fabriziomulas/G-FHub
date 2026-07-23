"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X, User, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCart } from "@/stores/cart";
import { useUser } from "@/hooks/useUser";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Dropdown } from "@/components/ui/composites/Dropdown";

const links = [
  { label: "Shop", href: "/shop" },
  { label: "Nuovi Arrivi", href: "/shop/new" },
  { label: "Best Seller", href: "/shop/best-seller" },
  { label: "Offerte", href: "/shop/offerte" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const itemCount = mounted ? totalItems() : 0;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled ? "glass py-3" : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-text-primary tracking-tight">
            STORELUXE
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.role === "ADMIN" && (
                  <Link href="/admin" className="text-sm text-accent-electric hover:text-accent-purple transition-colors font-medium">
                    Admin
                  </Link>
                )}
                <Dropdown
                  trigger={
                    <button className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors">
                      <User size={16} />
                      {user.name || user.email}
                    </button>
                  }
                  items={[
                    { label: "I miei ordini", onClick: () => window.location.href = "/account" },
                    { label: "Esci", danger: true, onClick: logout, icon: <LogOut size={14} /> },
                  ]}
                />
                <button onClick={() => setCartOpen(true)} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Carrello ({itemCount})
                </button>
              </>
            ) : (
              <>
                <Link href="/account/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Accedi
                </Link>
                <button onClick={() => setCartOpen(true)} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Carrello ({itemCount})
                </button>
              </>
            )}
          </div>

          <button className="md:hidden text-text-primary p-1" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass border-t border-border-default mt-3"
            >
              <div className="px-6 py-4 flex flex-col gap-3">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors py-1">
                    {link.label}
                  </Link>
                ))}
                <hr className="border-border-default" />
                {user ? (
                  <>
                    {user.role === "ADMIN" && (
                      <Link href="/admin" onClick={() => setMobileOpen(false)} className="text-accent-electric font-medium py-1">
                        Admin
                      </Link>
                    )}
                    <Link href="/account" onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors py-1">
                      Account
                    </Link>
                    <button onClick={() => { setMobileOpen(false); logout(); }} className="text-red-400 text-left py-1">
                      Esci
                    </button>
                  </>
                ) : (
                  <Link href="/account/login" onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors py-1">
                    Accedi
                  </Link>
                )}
                <button onClick={() => { setMobileOpen(false); setCartOpen(true); }} className="text-text-secondary hover:text-text-primary transition-colors py-1 text-left">
                  Carrello ({itemCount})
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}