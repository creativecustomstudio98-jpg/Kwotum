import Link from "next/link";
import type { ReactNode } from "react";

import type { FaqItem } from "../../lib/marketing/content";
import { Brand } from "./marketing-header";

export function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <div className="marketing-container marketing-footer__shell" data-footer-layout>
        <div className="marketing-footer__grid">
          <div className="marketing-footer__intro">
            <Brand className="marketing-brand--footer" withMark />
            <p className="marketing-footer__tagline">
              Od chaotycznego zapytania do uporządkowanego leada gotowego do działania.
            </p>
            <span className="marketing-footer__status">Produkt w fazie walidacji</span>
            <p className="marketing-footer__legal">
              Nazwa „Kwotum” wymaga profesjonalnej weryfikacji przed publicznym startem.
            </p>
          </div>
          <nav aria-label="Produkt">
            <strong>Produkt</strong>
            <Link href="/produkt">Możliwości</Link>
            <Link href="/jak-dziala">Jak działa</Link>
            <Link href="/funkcje">Funkcje</Link>
            <Link href="/cennik">Program pilotażowy</Link>
          </nav>
          <nav aria-label="Zastosowania">
            <strong>Zastosowania</strong>
            <Link href="/branze">Branże</Link>
            <Link href="/dla-agencji">Agencje</Link>
            <Link href="/wordpress">WordPress</Link>
            <Link href="/funkcje/widget-na-strone">Widget na stronę</Link>
          </nav>
          <nav aria-label="Informacje">
            <strong>Informacje</strong>
            <Link href="/logowanie" prefetch={false}>
              Logowanie
            </Link>
            <Link href="/jak-dziala#bezpieczenstwo">Bezpieczeństwo procesu</Link>
            <Link href="/polityka-prywatnosci">Polityka prywatności</Link>
            <Link href="/regulamin">Regulamin</Link>
          </nav>
        </div>
        <div className="marketing-footer__bottom">
          <span>© 2026 Kwotum</span>
          <span>Polska wersja · wynik orientacyjny · prywatny panel</span>
          <Link href="#main-content">Wróć na górę ↑</Link>
        </div>
      </div>
    </footer>
  );
}

export function MarketingHero({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="marketing-hero marketing-container">
      <div className="marketing-hero__copy">
        <p className="wy-kicker marketing-eyebrow">{eyebrow}</p>
        <h1 className="wy-marketing-heading-1">{title}</h1>
        {children}
      </div>
    </section>
  );
}

export function Breadcrumbs({ items }: { items: readonly { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Okruszki" className="marketing-breadcrumbs">
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function JsonLd({ value }: { value: Record<string, unknown> }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(value).replaceAll("<", "\\u003c"),
      }}
      type="application/ld+json"
    />
  );
}

export function Faq({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="marketing-faq">
      {items.map((item) => (
        <details key={item.question}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function CtaBand({ description, title }: { description: string; title: string }) {
  return (
    <section className="marketing-container marketing-cta-band">
      <div>
        <p className="wy-kicker marketing-eyebrow">Następny krok</p>
        <h2 className="wy-marketing-heading-2">{title}</h2>
        <p className="wy-marketing-lead">{description}</p>
      </div>
      <div className="marketing-actions">
        <Link className="marketing-button marketing-button--light" href="/jak-dziala">
          Zobacz, jak działa
        </Link>
        <Link
          className="marketing-button marketing-button--outline-light"
          href="/logowanie"
          prefetch={false}
        >
          Przejdź do panelu
        </Link>
      </div>
    </section>
  );
}

export function ArrowIcon() {
  return <span aria-hidden="true">→</span>;
}

export function ProductWorkspace({
  compact = false,
  label = "Demonstracyjny widok uporządkowanego leada",
}: {
  compact?: boolean;
  label?: string;
}) {
  return (
    <figure
      aria-label={label}
      className={`wy-data-surface product-workspace${compact ? " product-workspace--compact" : ""}`}
    >
      <figcaption className="wy-sr-only">
        Syntetyczny przykład uporządkowanego briefu leada z zakresem, budżetem, terminem,
        lokalizacją, załącznikami, oceną dopasowania i następnym krokiem.
      </figcaption>

      <section className="product-workspace__brief" aria-label="Brief leada">
        <header className="product-workspace__brief-header">
          <div className="product-workspace__lead-title">
            <div>
              <strong>Lead L-2026-0152</strong>
              <span>Nowe zapytanie · dane demonstracyjne</span>
            </div>
          </div>
          <span className="product-status">
            <span aria-hidden="true">✓</span> Gotowy do kontaktu
          </span>
        </header>

        <div className="product-workspace__body">
          <dl className="product-workspace__data">
            <ProductField label="Zakres projektu">
              <strong>Kuchnia na wymiar</strong>
              <span>Zabudowa meblowa, blat, AGD i montaż</span>
            </ProductField>
            <ProductField label="Budżet">
              <strong>30–45 tys. zł</strong>
              <span>Zakres akceptowalny</span>
            </ProductField>
            <ProductField label="Termin">
              <strong>Do 3 miesięcy</strong>
              <span>Realny do realizacji</span>
            </ProductField>
            <ProductField label="Lokalizacja">
              <strong>Warszawa</strong>
              <span>W obszarze działania</span>
            </ProductField>
            <ProductField label="Załączniki">
              <strong>2 pliki</strong>
              <span>Rzut pomieszczenia.pdf · Inspiracje-kuchni.jpg</span>
            </ProductField>
          </dl>

          <aside className="product-workspace__decision" aria-label="Ocena dopasowania">
            <div className="product-workspace__score">
              <span>Dopasowanie</span>
              <strong>
                85<small>/100</small>
              </strong>
              <div
                aria-label="Dopasowanie: 85 na 100"
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={85}
                className="product-workspace__score-bar"
                role="progressbar"
              >
                <span aria-hidden="true" />
              </div>
            </div>
            <div className="product-workspace__reasons">
              <h3>Powody dopasowania</h3>
              <ul>
                <li>Budżet zgodny z ofertą</li>
                <li>Termin realny do realizacji</li>
                <li>Zakres projektu w ofercie</li>
              </ul>
            </div>
            <p>Lead ma komplet informacji potrzebnych do pierwszego kontaktu.</p>
          </aside>
        </div>

        <footer className="product-workspace__footer">
          <dl className="product-workspace__meta">
            <div>
              <dt>Opiekun</dt>
              <dd>Jan Kowalski</dd>
            </div>
            <div>
              <dt>Utworzono</dt>
              <dd>
                <time dateTime="2026-05-14T10:24:00+02:00">14.05.2026, 10:24</time>
              </dd>
            </div>
          </dl>
          <div className="product-workspace__next">
            <span>Następny krok</span>
            <strong>Przygotuj pierwszą rozmowę</strong>
            <Link href="/jak-dziala">
              Zobacz proces <ArrowIcon />
            </Link>
          </div>
        </footer>
      </section>
    </figure>
  );
}

function ProductField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="product-workspace__field">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
