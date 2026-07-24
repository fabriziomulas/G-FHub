import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { Button } from "@/components/ui/primitives/Button";
import Link from "next/link";

export default function ChiSiamoPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen">
        {/* Hero */}
        <section className="py-20 px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-4">
            La nostra <span className="text-gradient">storia</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Storeluxe nasce dalla passione per il design senza compromessi e la qualità artigianale.
          </p>
        </section>

        {/* Mission */}
        <section className="py-16 px-6 bg-background-secondary">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-4">La nostra missione</h2>
              <p className="text-text-secondary leading-relaxed">
                Crediamo che ogni prodotto debba raccontare una storia. Selezioniamo con cura maniacale ogni materiale, 
                curiamo ogni dettaglio e consegniamo solo ciò che supera i nostri standard. 
                Non vendiamo prodotti, creiamo esperienze che durano nel tempo.
              </p>
            </div>
            <div className="glass p-8 rounded-2xl text-center">
              <p className="text-5xl font-bold text-accent-electric mb-2">2024</p>
              <p className="text-text-secondary">Anno di fondazione</p>
            </div>
          </div>
        </section>

        {/* Valori */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-12">I nostri valori</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass p-6 rounded-2xl">
                <span className="text-3xl mb-3 block">✨</span>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Qualità</h3>
                <p className="text-text-secondary text-sm">Solo materiali premium e controlli rigorosi.</p>
              </div>
              <div className="glass p-6 rounded-2xl">
                <span className="text-3xl mb-3 block">🎨</span>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Design</h3>
                <p className="text-text-secondary text-sm">Estetica senza tempo, funzionalità moderna.</p>
              </div>
              <div className="glass p-6 rounded-2xl">
                <span className="text-3xl mb-3 block">🤝</span>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Fiducia</h3>
                <p className="text-text-secondary text-sm">Trasparenza e rapporto diretto con i clienti.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Scopri la nostra collezione</h2>
          <Link href="/shop">
            <Button variant="primary" size="lg">Vai allo Shop</Button>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}