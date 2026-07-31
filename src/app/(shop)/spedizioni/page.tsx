import { Truck, Clock, MapPin, PackageCheck } from "lucide-react";
import { LegalPage, LegalSection, PlaceholderNote } from "@/components/legal/LegalPage";

export default function SpedizioniPage() {
  return (
    <LegalPage title="Spedizioni" updatedAt="31 luglio 2026">
      <PlaceholderNote>
        Tempi di lavorazione, corriere e costi di spedizione sotto sono segnaposto indicativi. Vanno sostituiti con i vostri dati reali prima di pubblicare la pagina.
      </PlaceholderNote>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose">
        <div className="flex flex-col items-center text-center gap-2 bg-white/5 border border-white/10 rounded-xl p-4">
          <Clock size={18} className="text-accent-electric" />
          <span className="text-white text-sm font-medium">1-2 giorni lavorativi</span>
          <span className="text-gray-500 text-xs">Tempo di lavorazione ordine</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2 bg-white/5 border border-white/10 rounded-xl p-4">
          <Truck size={18} className="text-accent-electric" />
          <span className="text-white text-sm font-medium">2-4 giorni lavorativi</span>
          <span className="text-gray-500 text-xs">Tempo di consegna stimato</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2 bg-white/5 border border-white/10 rounded-xl p-4">
          <MapPin size={18} className="text-accent-electric" />
          <span className="text-white text-sm font-medium">Italia</span>
          <span className="text-gray-500 text-xs">Area di consegna attuale</span>
        </div>
      </div>

      <LegalSection title="Area di consegna">
        <p>
          Al momento spediamo esclusivamente in Italia. Stiamo valutando l&apos;estensione della spedizione ad altri paesi europei.
        </p>
      </LegalSection>

      <LegalSection title="Tempi di lavorazione e consegna">
        <p>
          Gli ordini vengono lavorati entro <strong className="text-white">[da completare]</strong> giorni lavorativi dalla conferma del pagamento. Una volta spedito, riceverai un&apos;email di notifica con i dettagli dell&apos;ordine. Il tempo di consegna stimato è di <strong className="text-white">[da completare]</strong> giorni lavorativi, a seconda della destinazione.
        </p>
      </LegalSection>

      <LegalSection title="Costi di spedizione">
        <p>
          I costi di spedizione vengono calcolati e mostrati in fase di checkout prima della conferma del pagamento. <span className="text-gray-500">[Specificare qui eventuali soglie per la spedizione gratuita.]</span>
        </p>
      </LegalSection>

      <LegalSection title="Corriere">
        <p>
          Le spedizioni vengono affidate a corrieri espressi selezionati per garantire tracciabilità e sicurezza del pacco. <span className="text-gray-500">[Specificare il nome del corriere/dei corrieri utilizzati.]</span>
        </p>
      </LegalSection>

      <LegalSection title="Imballaggio">
        <div className="flex items-start gap-3">
          <PackageCheck size={18} className="text-accent-electric shrink-0 mt-0.5" />
          <p>
            Ogni prodotto viene imballato con cura in confezione protettiva per garantire che arrivi integro. Trattandosi di articoli di gioielleria, prestiamo particolare attenzione alla protezione durante il trasporto.
          </p>
        </div>
      </LegalSection>

      <LegalSection title="Problemi con la consegna">
        <p>
          Se il tuo ordine non arriva entro i tempi indicati o riscontri un problema con la spedizione, contattaci a{" "}
          <span className="text-white">info@gfhubs.com</span> indicando il numero d&apos;ordine.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
