import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./home-reference.module.css";

type GlyphKind =
  | "budget"
  | "clock"
  | "files"
  | "install"
  | "location"
  | "next"
  | "project"
  | "quality"
  | "scope"
  | "term";
type RailGlyphKind = "brief" | "contacts" | "home" | "insights" | "notifications" | "settings";

const glyphClasses: Record<GlyphKind, string> = {
  budget: styles.glyphBudget!,
  clock: styles.glyphClock!,
  files: styles.glyphFiles!,
  install: styles.glyphInstall!,
  location: styles.glyphLocation!,
  next: styles.glyphNext!,
  project: styles.glyphProject!,
  quality: styles.glyphQuality!,
  scope: styles.glyphScope!,
  term: styles.glyphTerm!,
};

const railGlyphClasses: Record<RailGlyphKind, string> = {
  brief: styles.railGlyphBrief!,
  contacts: styles.railGlyphContacts!,
  home: styles.railGlyphHome!,
  insights: styles.railGlyphInsights!,
  notifications: styles.railGlyphNotifications!,
  settings: styles.railGlyphSettings!,
};

const missingDetails = [
  "zakresu",
  "lokalizacji",
  "budżetu",
  "materiałów",
  "terminu",
  "wymiarów",
] as const;

const completeDetails = [
  "Kuchnia w kształcie L",
  "Około 8 mb zabudowy",
  "Budżet 25–35 tys. zł",
  "Termin do 3 miesięcy",
  "Ciechanów",
  "3 zdjęcia pomieszczenia",
  "Kontakt telefoniczny do 24 h",
] as const;

export function HomeGlyph({ kind }: { kind: GlyphKind }) {
  return (
    <span aria-hidden="true" className={`${styles.glyph} ${glyphClasses[kind]}`}>
      <i />
    </span>
  );
}

export function HeroTransformationProof() {
  return (
    <figure
      aria-label="Dane demonstracyjne: trzy odpowiedzi klienta zmieniają się w uporządkowany lead"
      className={styles.heroProof}
      data-home-proof="hero-transformation"
      data-intro="right"
      data-reveal-delay="4"
      id="przykladowy-lead"
    >
      <figcaption className="wy-sr-only">
        Trzy odpowiedzi klienta o usłudze, budżecie i terminie przechodzą do dokumentu leada z
        zakresem, lokalizacją, materiałami, dopasowaniem i następnym krokiem.
      </figcaption>

      <span aria-hidden="true" className={styles.heroHalo} />

      <article aria-label="Początkowe zapytanie klienta" className={styles.inquiryPhone}>
        <div className={styles.phoneChrome}>
          <span aria-hidden="true" className={styles.phoneCamera} />
          <header className={styles.phoneStatus}>
            <span>9:41</span>
            <span aria-hidden="true">● 􀙇</span>
          </header>
          <div className={styles.inquiryScreen}>
            <span className={styles.deviceKicker}>Nowe zapytanie</span>
            <div className={styles.inquiryAvatar}>AK</div>
            <strong>Anna napisała do firmy</strong>
            <blockquote>Dzień dobry, ile kosztuje kuchnia na wymiar? Proszę o kontakt.</blockquote>
            <span className={styles.missingHint}>Brakuje 6 kluczowych informacji</span>
          </div>
        </div>
      </article>

      <article aria-label="Prowadzony proces klienta" className={styles.processPhone}>
        <div className={styles.phoneChrome}>
          <span aria-hidden="true" className={styles.phoneCamera} />
          <header className={styles.phoneStatus}>
            <span>9:42</span>
            <span aria-hidden="true">● 􀙇</span>
          </header>
          <div className={styles.processScreen}>
            <div className={styles.processBrand}>
              <ProductMark />
              <strong>Kwotum</strong>
              <span>3 z 6</span>
            </div>
            <div className={styles.phoneProgress}>
              <span aria-hidden="true" />
            </div>
            <span className={styles.deviceKicker}>Budżet projektu</span>
            <h2>Jaki budżet planujesz?</h2>
            <p>Wybierz orientacyjny przedział. Wynik nadal będzie niewiążący.</p>
            <ul className={styles.phoneOptions}>
              <li>15 000–25 000 zł</li>
              <li className={styles.phoneOptionActive}>
                <span>25 000–35 000 zł</span>
                <span aria-hidden="true">✓</span>
              </li>
              <li>35 000–50 000 zł</li>
            </ul>
            <Link className={styles.phoneAction} href="/branze/meble-na-wymiar">
              Przejdź ten proces
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </article>

      <article
        aria-label="Dane demonstracyjne: dokument leada gotowego do rozmowy"
        className={styles.resultPhone}
        data-home-proof="lead-document"
      >
        <div className={styles.phoneChrome}>
          <span aria-hidden="true" className={styles.phoneCamera} />
          <header className={styles.phoneStatus}>
            <span>9:44</span>
            <span aria-hidden="true">● 􀙇</span>
          </header>
          <div className={styles.resultScreen}>
            <header className={styles.resultHeader}>
              <span>
                <span className={styles.resultAvatar}>AK</span>
                <span>
                  <strong>Anna Kowalska</strong>
                  <small>Kuchnia na wymiar</small>
                </span>
              </span>
              <span className={styles.resultReady}>Gotowy lead</span>
            </header>
            <div className={styles.resultScore}>
              <span>
                <strong>85</strong>
                <small>/100</small>
              </span>
              <span>Dobre dopasowanie</span>
            </div>
            <div
              aria-label="Dopasowanie: 85 na 100"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={85}
              className={styles.resultScoreBar}
              role="progressbar"
            >
              <span aria-hidden="true" />
            </div>
            <dl className={styles.resultRows}>
              <div>
                <dt>Zakres</dt>
                <dd>Kuchnia L · ok. 8 mb</dd>
              </div>
              <div>
                <dt>Budżet</dt>
                <dd>25–35 tys. zł</dd>
              </div>
              <div>
                <dt>Termin</dt>
                <dd>Do 3 miesięcy</dd>
              </div>
              <div>
                <dt>Lokalizacja</dt>
                <dd>Ciechanów</dd>
              </div>
            </dl>
            <div className={styles.resultNext}>
              <span>Następny krok</span>
              <strong>Kontakt do 24 h</strong>
            </div>
            <Link className={styles.resultAction} href="/logowanie" prefetch={false}>
              Rozpocznij obsługę
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </article>

      <div aria-hidden="true" className={styles.phoneJourney}>
        <span>Zapytanie</span>
        <i />
        <span>Proces</span>
        <i />
        <span>Lead</span>
      </div>
    </figure>
  );
}

export function ComparisonProof() {
  return (
    <figure
      className={styles.comparison}
      data-home-proof="inquiry-comparison"
      data-reveal="up"
      data-reveal-delay="2"
    >
      <figcaption className="wy-sr-only">
        Porównanie typowego krótkiego zapytania z kompletnym leadem po przejściu procesu Kwotum.
      </figcaption>

      <article className={styles.comparisonBefore}>
        <header>
          <strong>Typowe zapytanie</strong>
        </header>
        <blockquote>
          <span>Dzień dobry,</span>
          <span>ile kosztuje kuchnia na wymiar?</span>
          <span>Proszę o kontakt.</span>
          <time dateTime="2026-05-14T09:31:00+02:00">09:31</time>
        </blockquote>
        <div className={styles.missingList}>
          <strong>Brakuje:</strong>
          <ul>
            {missingDetails.map((item) => (
              <li key={item}>
                <span aria-hidden="true">×</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </article>

      <span aria-hidden="true" className={styles.comparisonArrow}>
        →
      </span>

      <article className={styles.comparisonAfter}>
        <header>
          <strong>Lead po przejściu Kwotum</strong>
        </header>
        <ul>
          {completeDetails.map((item) => (
            <li key={item}>
              <span aria-hidden="true">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <p>Handlowiec może ocenić zapytanie przed pierwszą rozmową.</p>
      </article>
    </figure>
  );
}

export function CompactLeadDocument() {
  return <LeadDocument compact />;
}

function LeadDocument({ compact = false }: { compact?: boolean }) {
  return (
    <article
      aria-label={
        compact
          ? "Dane demonstracyjne: skrócony dokument gotowego leada"
          : "Dane demonstracyjne: dokument leada gotowego do rozmowy"
      }
      className={`${styles.leadDocument}${compact ? ` ${styles.compactLead}` : ""}`}
      data-home-proof={compact ? "compact-lead" : "lead-document"}
      data-reveal={compact ? "left" : undefined}
      data-reveal-delay={compact ? "4" : undefined}
    >
      <aside aria-hidden="true" className={styles.leadRail}>
        <span className={styles.railMark}>
          <ProductMark />
        </span>
        <RailGlyph kind="home" />
        <RailGlyph kind="contacts" />
        <RailGlyph kind="brief" />
        <RailGlyph kind="insights" />
        <RailGlyph kind="settings" />
        <span className={styles.railSpacer} />
        <RailGlyph kind="notifications" />
        <span className={styles.railAvatar}>AK</span>
      </aside>

      <div className={styles.leadCanvas}>
        <header className={styles.leadHeader}>
          <span className={styles.mobileLeadTitle}>
            <span className={styles.mobileLeadTitleLong}>Gotowy lead dla firmy</span>
            <span className={styles.mobileLeadTitleCompact}>Gotowy lead</span>
          </span>
          <div className={styles.leadPerson}>
            <span aria-hidden="true" className={styles.avatar}>
              <i />
            </span>
            <span>
              <strong>Anna Kowalska</strong>
              <small>Kuchnia na wymiar</small>
            </span>
          </div>
          <div className={styles.leadMeta}>
            <span>ID: L-2024-0517</span>
            <time dateTime="2024-05-17T09:41:00+02:00">17.05.2024, 09:41</time>
          </div>
        </header>

        <section aria-label="Ocena dopasowania" className={styles.leadMatch}>
          <div className={styles.score}>
            <strong>
              85<small>/100</small>
            </strong>
            <span>Dobre dopasowanie</span>
          </div>
          <div
            aria-label="Dopasowanie: 85 na 100"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={85}
            className={styles.scoreBar}
            role="progressbar"
          >
            <span aria-hidden="true" />
          </div>
          <ul className={styles.matchReasons}>
            <li>
              <span aria-hidden="true">✓</span>
              <span className={styles.reasonLong}>Budżet w oczekiwanym przedziale</span>
              <span className={styles.reasonCompact}>Budżet w przedziale</span>
            </li>
            <li>
              <span aria-hidden="true">✓</span>
              Realny termin realizacji
            </li>
            <li>
              <span aria-hidden="true">✓</span>
              Komplet kluczowych informacji
            </li>
          </ul>
        </section>

        <dl className={styles.leadRows}>
          <LeadRow kind="project" label="Zakres">
            <span className={styles.fullValue}>Kuchnia w kształcie L, około 8 mb zabudowy</span>
            <span className={styles.mobileValue}>Kuchnia L · ok. 8 mb</span>
          </LeadRow>
          <LeadRow kind="budget" label="Budżet">
            <span className={styles.fullValue}>25 000–35 000 zł</span>
            <span className={styles.mobileValue}>25–35 tys. zł</span>
          </LeadRow>
          <LeadRow kind="term" label="Termin">
            <span className={styles.fullValue}>Do 3 miesięcy</span>
            <span className={styles.mobileValue}>Do 3 mies.</span>
          </LeadRow>
          <LeadRow kind="location" label="Lokalizacja">
            Ciechanów
          </LeadRow>
          <LeadRow kind="files" label="Materiały">
            <span className={styles.materialCount}>3 zdjęcia pomieszczenia</span>
            <span aria-hidden="true" className={styles.thumbnails}>
              <span>
                <i />
                <i />
                <i />
              </span>
              <span>
                <i />
                <i />
                <i />
              </span>
              <span className={styles.moreThumbnail}>+1</span>
            </span>
          </LeadRow>
        </dl>

        <div className={styles.leadNext}>
          <span>
            <HomeGlyph kind="next" />
            <strong>Następny krok</strong>
          </span>
          <span>Kontakt telefoniczny do 24 h</span>
        </div>

        <footer className={styles.leadActions}>
          <Link href="/logowanie" prefetch={false}>
            Rozpocznij obsługę
          </Link>
          <Link href="/logowanie" prefetch={false}>
            Dodaj notatkę
          </Link>
          <Link aria-label="Zobacz pełny proces" className={styles.moreAction} href="/jak-dziala">
            <span aria-hidden="true">•••</span>
          </Link>
        </footer>
      </div>
    </article>
  );
}

function ProductMark() {
  return (
    <span aria-hidden="true" className={styles.productMark}>
      <i />
      <i />
      <i />
    </span>
  );
}

function RailGlyph({ kind }: { kind: RailGlyphKind }) {
  return (
    <span className={`${styles.railGlyph} ${railGlyphClasses[kind]}`}>
      <i />
    </span>
  );
}

function LeadRow({
  children,
  kind,
  label,
}: {
  children: ReactNode;
  kind: GlyphKind;
  label: string;
}) {
  return (
    <div className={styles.leadRow}>
      <dt>
        <HomeGlyph kind={kind} />
        <span>{label}</span>
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
