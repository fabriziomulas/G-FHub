import { LegalPage, LegalSection, PlaceholderNote } from "@/components/legal/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage title="Informativa sulla Privacy" updatedAt="31 luglio 2026">
      <PlaceholderNote>
        Questa informativa contiene testo standard conforme al GDPR (Regolamento UE 2016/679), ma i dati identificativi del titolare del trattamento sono segnaposto. Vanno completati con ragione sociale, P.IVA, sede legale ed email prima di pubblicare la pagina.
      </PlaceholderNote>

      <LegalSection title="1. Titolare del trattamento">
        <p>
          Il titolare del trattamento dei dati raccolti tramite questo sito è:
          <br />
          <strong className="text-white">[Ragione sociale da completare]</strong>, P.IVA [da completare], con sede legale in [indirizzo da completare].
          <br />
          Per qualsiasi richiesta relativa al trattamento dei tuoi dati personali puoi scrivere a{" "}
          <span className="text-white">info@gfhubs.com</span>.
        </p>
      </LegalSection>

      <LegalSection title="2. Dati raccolti">
        <p>Nel corso della navigazione e dell&apos;utilizzo del sito raccogliamo:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Dati forniti volontariamente in fase di registrazione o acquisto: nome, email, indirizzo di spedizione, numero di telefono.</li>
          <li>Dati relativi agli ordini effettuati e allo storico degli acquisti.</li>
          <li>Dati tecnici di navigazione (indirizzo IP, tipo di browser, pagine visitate).</li>
          <li>
            Dati di pagamento: le transazioni sono gestite direttamente da Stripe, Inc. Non riceviamo né conserviamo i dati completi della tua carta di credito.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Finalità e base giuridica del trattamento">
        <p>I tuoi dati vengono trattati per le seguenti finalità:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Gestione ed evasione degli ordini, inclusa la comunicazione via email sullo stato della spedizione (esecuzione del contratto).</li>
          <li>Gestione dell&apos;account utente, wishlist e programma fedeltà (esecuzione del contratto).</li>
          <li>Gestione di richieste di reso e assistenza clienti (esecuzione del contratto / legittimo interesse).</li>
          <li>Adempimento di obblighi legali e fiscali (obbligo di legge).</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Conservazione dei dati">
        <p>
          I dati relativi agli ordini sono conservati per il tempo necessario ad adempiere agli obblighi fiscali e contabili previsti dalla legge italiana. I dati dell&apos;account restano attivi finché non richiedi la cancellazione.
        </p>
      </LegalSection>

      <LegalSection title="5. Comunicazione dei dati a terzi">
        <p>
          I tuoi dati possono essere comunicati a fornitori terzi strettamente necessari all&apos;erogazione del servizio: gestore dei pagamenti (Stripe), corriere per la spedizione, provider di invio email transazionali (Resend). Questi soggetti trattano i dati in qualità di responsabili del trattamento o titolari autonomi, nel rispetto della normativa vigente.
        </p>
      </LegalSection>

      <LegalSection title="6. I tuoi diritti">
        <p>In qualità di interessato, hai il diritto di:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Accedere ai tuoi dati personali e ottenerne copia.</li>
          <li>Richiedere la rettifica di dati inesatti o incompleti.</li>
          <li>Richiedere la cancellazione dei dati (diritto all&apos;oblio), salvo obblighi di conservazione di legge.</li>
          <li>Opporti al trattamento o richiederne la limitazione.</li>
          <li>Richiedere la portabilità dei dati.</li>
          <li>Proporre reclamo al Garante per la Protezione dei Dati Personali.</li>
        </ul>
        <p>Per esercitare questi diritti scrivi a <span className="text-white">info@gfhubs.com</span>.</p>
      </LegalSection>

      <LegalSection title="7. Cookie">
        <p>
          Il sito utilizza cookie tecnici necessari al funzionamento (es. autenticazione, carrello) e cookie di terze parti legati ai servizi di pagamento. Non vengono utilizzati cookie di profilazione pubblicitaria al di fuori di quelli eventualmente configurati tramite strumenti di analisi, per i quali verrà richiesto il consenso esplicito ove previsto dalla normativa.
        </p>
      </LegalSection>

      <LegalSection title="8. Modifiche a questa informativa">
        <p>
          Questa informativa può essere aggiornata periodicamente. La data di ultimo aggiornamento è indicata in cima alla pagina.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
