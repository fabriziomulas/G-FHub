import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0C0A09] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <Link href="/" className="text-lg font-bold text-white tracking-tight">
            STORELUXE
          </Link>
          <p className="text-gray-500 text-xs mt-1">Gioielleria premium</p>
        </div>
        <div className="flex gap-6 text-sm text-gray-400">
          <span>📧 info@gfhubs.com</span>
          <span>📱 +39 351 857 1990</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">Privacy</Link>
          <Link href="/termini" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">Termini</Link>
          <Link href="/spedizioni" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">Spedizioni</Link>
          <Link href="/resi" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">Resi</Link>
          <p className="text-gray-500 text-xs">© {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}