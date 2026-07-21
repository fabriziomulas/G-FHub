import Link from "next/link";
import { Input } from "@/components/ui/primitives/Input";
import { Button } from "@/components/ui/primitives/Button";

const footerLinks = {
  shop: {
    title: "Shop",
    links: [
      { label: "Tutti i prodotti", href: "/shop" },
      { label: "Nuovi arrivi", href: "/shop/new" },
      { label: "Best seller", href: "/shop/best-seller" },
      { label: "Offerte", href: "/shop/offerte" },
    ],
  },
  assistenza: {
    title: "Assistenza",
    links: [
      { label: "Contatti", href: "/contatti" },
      { label: "Spedizioni", href: "/spedizioni" },
      { label: "Resi", href: "/resi" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  azienda: {
    title: "Azienda",
    links: [
      { label: "Chi siamo", href: "/chi-siamo" },
      { label: "Sostenibilità", href: "/sostenibilita" },
      { label: "Lavora con noi", href: "/lavora-con-noi" },
    ],
  },
};

export function Footer() {
  return (
    <footer className="bg-background-secondary border-t border-border-default">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand + Newsletter */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-xl font-bold text-text-primary tracking-tight">
              STORELUXE
            </Link>
            <p className="text-text-muted text-sm mt-3 max-w-sm">
              Esperienza di shopping premium. Design futuristico, qualità senza compromessi.
            </p>
            <div className="mt-5 flex gap-2">
              <Input
                variant="glass"
                placeholder="email@esempio.com"
                className="flex-1"
              />
              <Button size="sm">Iscriviti</Button>
            </div>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="text-text-primary text-sm font-semibold mb-3">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-text-muted text-sm hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-border-default flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-xs">
            © {new Date().getFullYear()} Storeluxe. Tutti i diritti riservati.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-text-muted text-xs hover:text-text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/termini" className="text-text-muted text-xs hover:text-text-primary transition-colors">
              Termini
            </Link>
            <Link href="/cookie" className="text-text-muted text-xs hover:text-text-primary transition-colors">
              Cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}