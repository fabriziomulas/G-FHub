import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { InstagramIcon, TikTokIcon } from "@/components/icons/SocialIcons";

const INSTAGRAM_URL = "https://www.instagram.com/g.f.hub0?igsh=dXVrc3VkaDQxaTVy&utm_source=qr";
const TIKTOK_URL = "https://www.tiktok.com/@gfhub.store?_r=1&_t=ZN-98WeDsPnX4I";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-text-primary border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <Link href="/" className="inline-flex hover:opacity-80 transition-opacity">
            <Image
              src="/brand/logo-full.png"
              alt="G&F Hub"
              width={265}
              height={240}
              className="h-9 w-auto"
            />
          </Link>

          <p className="text-gray-500 text-xs mt-1">
            {t("tagline")}
          </p>

          <div className="flex items-center gap-3 mt-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("instagramLabel")}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <InstagramIcon size={18} />
            </a>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("tiktokLabel")}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <TikTokIcon size={18} />
            </a>
          </div>
        </div>

        <div className="flex gap-6 text-sm text-gray-400">
          <span>📧 g.f.hub0@gmail.com</span>
          <span>📱 +39 351 857 1990</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/guida-taglie"
            className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
          >
            {t("guidaTaglie")}
          </Link>

          <Link
            href="/cura-gioielli"
            className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
          >
            {t("curaGioielli")}
          </Link>

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
