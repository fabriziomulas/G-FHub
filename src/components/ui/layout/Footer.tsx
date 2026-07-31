import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-text-primary border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <Link
            href="/"
            className="text-lg font-bold text-white tracking-tight"
          >
            G&amp;F HUB
          </Link>

          <p className="text-gray-500 text-xs mt-1">
            {t("tagline")}
          </p>
        </div>

        <div className="flex gap-6 text-sm text-gray-400">
          <span>📧 g.f.hub0@gmail.com</span>
          <span>📱 +39 351 857 1990</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/privacy"
            className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
          >
            {t("privacy")}
          </Link>

          <Link
            href="/termini"
            className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
          >
            {t("termini")}
          </Link>

          <Link
            href="/spedizioni"
            className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
          >
            {t("spedizioni")}
          </Link>

          <Link
            href="/resi"
            className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
          >
            {t("resi")}
          </Link>

          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
