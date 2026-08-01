import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { AlertTriangle } from "lucide-react";

export function LegalPage({
  title,
  updatedAtLabel,
  updatedAt,
  children,
}: {
  title: string;
  updatedAtLabel?: string;
  updatedAt?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      <main className="pt-24 min-h-screen bg-text-primary">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h1 className={`text-3xl md:text-4xl font-bold text-white ${updatedAtLabel && updatedAt ? "mb-2" : "mb-8"}`}>{title}</h1>
          {updatedAtLabel && updatedAt && (
            <p className="text-gray-500 text-sm mb-10">{updatedAtLabel} {updatedAt}</p>
          )}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 space-y-8 text-gray-300 text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-white text-lg font-semibold mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function PlaceholderNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-amber-300 text-xs leading-relaxed">
      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}
