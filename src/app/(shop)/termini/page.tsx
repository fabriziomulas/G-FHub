import { LegalPage, LegalSection, PlaceholderNote } from "@/components/legal/LegalPage";

export default function TerminiPage() {
  return (
    <LegalPage title="Termini e Condizioni di Vendita" updatedAt="31 luglio 2026">
      <PlaceholderNote>
        Testo standard conforme al Codice del Consumo italiano (D.Lgs. 206/2005). I dati identificativi del venditore sono segnaposto e vanno completati prima di pubblicare la pagina.
      </PlaceholderNote>

      <LegalSection title="1. Il venditore">
        <p>
          Il presente sito e-commerce è gestito da <strong className="text-white">[Ragione sociale da completare]</strong>, P.IVA [da completare], con sede legale in [indirizzo da completare] (di seguito &quot;Storeluxe&quot;). Contatti: info@gfhubs.com — +39 351 857 1990.
        </p>
      </LegalSection>

      <LegalSection title="2. Conclusione del contratto">
        <p>
          La visualizzazione dei prodotti sul sito costituisce un invito ad offrire e non un&apos;offerta al pubblico. L&apos;ordine effettuato dal cliente costituisce una proposta di acquisto, che si considera accettata al momento della conferma del pagamento tramite il nostro provider Stripe.
        </p>
      </LegalSection>

      <LegalSection title="3. Prezzi e pagamento">
        <p>
          Tutti i prezzi indicati sul sito sono espressi in Euro (€) e si intendono comprensivi di IVA, salvo eventuali costi di spedizione indicati separatamente in fase di checkout. I pagamenti sono processati in modo sicuro tramite Stripe e sono accettate le modalità disponibili al momento del checkout (carta di credito/debito e, ove disponibile, Klarna).
        </p>
      </LegalSection>

      <LegalSection title="4. Spedizione">
        <p>
          Le condizioni di spedizione, i tempi di consegna e i relativi costi sono indicati nella pagina dedicata{" "}
          <a href="/spedizioni" className="text-accent-electric hover:underline">Spedizioni</a>.
        </p>
      </LegalSection>

      <LegalSection title="5. Diritto di recesso">
        <p>
          Ai sensi degli artt. 52-59 del Codice del Consumo, il cliente consumatore ha diritto di recedere dal contratto senza dover fornire alcuna motivazione entro <strong className="text-white">14 giorni</strong> dalla data di ricezione del prodotto.
        </p>
        <p>
          Per esercitare il diritto di recesso è possibile utilizzare il modulo disponibile nella pagina{" "}
          <a href="/resi" className="text-accent-electric hover:underline">Resi</a>. Il prodotto dovrà essere restituito integro, non utilizzato e nella confezione originale. Il rimborso verrà effettuato con lo stesso metodo di pagamento utilizzato per l&apos;acquisto, entro 14 giorni dal ricevimento del reso.
        </p>
        <PlaceholderNote>
          Se alcuni prodotti (es. gioielli personalizzati o realizzati su misura) sono esclusi dal diritto di recesso ai sensi dell&apos;art. 59 del Codice del Consumo, va specificato qui quali categorie sono escluse.
        </PlaceholderNote>
      </LegalSection>

      <LegalSection title="6. Garanzia legale di conformità">
        <p>
          Tutti i prodotti venduti sono coperti dalla garanzia legale di conformità di 24 mesi prevista dagli artt. 128-135 del Codice del Consumo, valida per difetti di conformità esistenti al momento della consegna.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitazione di responsabilità">
        <p>
          Storeluxe non è responsabile per ritardi o disservizi dovuti a cause di forza maggiore, né per un uso improprio dei prodotti acquistati rispetto alla loro destinazione d&apos;uso.
        </p>
      </LegalSection>

      <LegalSection title="8. Legge applicabile e foro competente">
        <p>
          Il presente contratto è regolato dalla legge italiana. Per le controversie relative a contratti conclusi con consumatori è competente il foro del luogo di residenza o domicilio del consumatore, se ubicato in Italia.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
