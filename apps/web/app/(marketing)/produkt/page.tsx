import Link from "next/link";

import { marketingMetadata } from "../../../lib/marketing/metadata";
import { ArrowIcon, Breadcrumbs } from "../components";

export const metadata = marketingMetadata(
  "System kwalifikacji zapytań dla firm usługowych",
  "Poznaj Kwotum: procesy, wersjonowanie, serwerowy pricing i scoring, widget, leady, pliki, powiadomienia oraz analityka.",
  "/produkt",
);

export default function ProductPage() {
  return (
    <>
      <section
        aria-labelledby="product-hero-title"
        className="marketing-container marketing-page-hero product-page-hero"
      >
        <Breadcrumbs items={[{ href: "/", label: "Start" }, { label: "Produkt" }]} />
        <div className="product-page-hero__layout">
          <div className="marketing-page-hero__copy">
            <p className="wy-kicker marketing-eyebrow">System kwalifikacji zapytań</p>
            <h1 id="product-hero-title">
              Jeden proces od konfiguracji do <span>gotowego leada.</span>
            </h1>
            <p>
              Firma buduje pytania i reguły, publikuje niezmienną wersję i osadza ten sam proces na
              stronie. Kwotum potwierdza wynik na serwerze i zapisuje lead razem z pełnym kontekstem
              zapytania.
            </p>
            <div className="marketing-actions">
              <Link className="marketing-button" href="/jak-dziala">
                Przejdź przez proces <ArrowIcon />
              </Link>
              <Link className="marketing-button marketing-button--secondary" href="/funkcje">
                Zobacz funkcje
              </Link>
            </div>
            <aside className="product-page-hero__scope" aria-label="Zakres MVP">
              <strong>Zakres MVP</strong>
              <p>
                Formularz, orientacyjny wynik, kwalifikacja, leady, powiadomienia i analityka. Bez
                płatności i pełnego CRM.
              </p>
            </aside>
          </div>

          <figure
            aria-labelledby="product-flow-proof-title"
            className="product-flow-proof"
            data-product-hero-proof
          >
            <figcaption>
              <span>Mapa produktu</span>
              <strong id="product-flow-proof-title">Od wersji roboczej do gotowego leada</strong>
              <small>Dane demonstracyjne</small>
            </figcaption>
            <ol>
              <li>
                <header>
                  <span>01</span>
                  <ProductFlowIcon kind="configure" />
                </header>
                <strong>Konfiguracja</strong>
                <p>Firma ustala pytania, warunki oraz reguły wyniku.</p>
                <ul>
                  <li>Pytania i logika</li>
                  <li>Reguły wyniku</li>
                  <li>Treści i zgody</li>
                </ul>
                <em>Wersja robocza</em>
              </li>
              <li>
                <header>
                  <span>02</span>
                  <ProductFlowIcon kind="publish" />
                </header>
                <strong>Publikacja</strong>
                <p>Publikacja zamyka snapshot używany przez aktywne sesje.</p>
                <ul>
                  <li>Niezmienna wersja</li>
                  <li>Widget i hosted link</li>
                  <li>Połączenie WordPress</li>
                </ul>
                <em>Proces dostępny</em>
              </li>
              <li>
                <header>
                  <span>03</span>
                  <ProductFlowIcon kind="lead" />
                </header>
                <strong>Gotowy lead</strong>
                <p>Serwer potwierdza wynik i zapisuje kompletny kontekst.</p>
                <ul>
                  <li>Odpowiedzi i kontakt</li>
                  <li>Budżet, termin i pliki</li>
                  <li>Powody dopasowania</li>
                </ul>
                <em>Gotowy do kontaktu</em>
              </li>
            </ol>
            <footer aria-label="Podział odpowiedzialności w procesie">
              <span>Przeglądarka prowadzi</span>
              <span>Serwer potwierdza</span>
              <span>Firma podejmuje decyzję</span>
            </footer>
          </figure>
        </div>
      </section>

      <section
        aria-labelledby="product-map-title"
        className="marketing-section marketing-section--surface product-map-section"
        id="mapa-produktu"
      >
        <div className="marketing-container product-map product-map--r2">
          <header className="marketing-section__heading product-map__heading">
            <div>
              <p className="wy-kicker marketing-eyebrow">Jedna ścieżka danych</p>
              <h2 id="product-map-title">
                Każdy moduł dokłada kontekst do <span>jednego rekordu leada.</span>
              </h2>
            </div>
            <p>
              Pytania, wynik i kontakt nie żyją w osobnych narzędziach. Opublikowana wersja prowadzi
              sesję, serwer potwierdza rezultat, a panel zachowuje pełny kontekst decyzji.
            </p>
          </header>

          <ProductSystemMap />
        </div>
      </section>

      <section
        aria-labelledby="product-boundaries-title"
        className="marketing-section marketing-section--dark product-boundaries-section"
        id="granice"
      >
        <div className="marketing-container product-boundaries product-boundaries--r2">
          <header className="product-boundaries__heading">
            <div>
              <p className="wy-kicker marketing-eyebrow">Kontrakt produktu</p>
              <h2 id="product-boundaries-title">
                Kwotum porządkuje proces. <span>Decyzja nadal należy do firmy.</span>
              </h2>
            </div>
            <p>
              System zbiera dane i potwierdza wynik jawnych reguł. Nie zastępuje oferty, CRM-u ani
              oceny handlowca.
            </p>
          </header>

          <ol aria-label="Granice odpowiedzialności produktu" className="product-boundaries__grid">
            <li data-product-boundary>
              <header>
                <ProductBoundaryIcon kind="estimate" />
                <span>01 · Wynik</span>
                <strong>Orientacyjny wynik</strong>
              </header>
              <dl>
                <div>
                  <dt>Kwotum</dt>
                  <dd>Potwierdza rezultat zapisanych reguł.</dd>
                </div>
                <div>
                  <dt>Firma</dt>
                  <dd>Weryfikuje zakres i przygotowuje finalną ofertę.</dd>
                </div>
              </dl>
            </li>
            <li data-product-boundary>
              <header>
                <ProductBoundaryIcon kind="lead" />
                <span>02 · Obsługa</span>
                <strong>Uporządkowany lead</strong>
              </header>
              <dl>
                <div>
                  <dt>Kwotum</dt>
                  <dd>Zapisuje kontekst oraz status zapytania.</dd>
                </div>
                <div>
                  <dt>Firma</dt>
                  <dd>Prowadzi sprzedaż i realizację zlecenia.</dd>
                </div>
              </dl>
            </li>
            <li data-product-boundary>
              <header>
                <ProductBoundaryIcon kind="rules" />
                <span>03 · Kontrola</span>
                <strong>Jawne reguły</strong>
              </header>
              <dl>
                <div>
                  <dt>Kwotum</dt>
                  <dd>Liczy tylko jawne, ograniczone warunki.</dd>
                </div>
                <div>
                  <dt>Firma</dt>
                  <dd>Ustala kryteria i podejmuje decyzję.</dd>
                </div>
              </dl>
            </li>
          </ol>

          <footer aria-label="Najważniejsza granica produktu">
            <span>Najważniejsza granica</span>
            <strong>Niewiążący wynik zawsze wymaga weryfikacji firmy.</strong>
          </footer>
        </div>
      </section>

      <ProductFinalCta />
    </>
  );
}

function ProductSystemMap() {
  return (
    <figure
      aria-labelledby="product-system-map-title"
      className="product-system-map"
      data-product-map-proof
    >
      <figcaption>
        <span>Mapa zależności</span>
        <strong id="product-system-map-title">Od definicji procesu do decyzji firmy</strong>
        <small>Dane demonstracyjne</small>
      </figcaption>

      <div className="product-system-map__body">
        <ol aria-label="Etapy prowadzące do rekordu leada" className="product-system-map__stages">
          <li data-product-map-stage>
            <ProductMapIcon kind="builder" />
            <div>
              <span>01 · Definicja</span>
              <strong>Builder i wersje</strong>
              <p>Draft zmienia się swobodnie. Publikacja zamyka używany snapshot.</p>
              <em>Proces opublikowany</em>
            </div>
          </li>
          <li data-product-map-stage>
            <ProductMapIcon kind="widget" />
            <div>
              <span>02 · Sesja</span>
              <strong>Widget i hosted link</strong>
              <p>Ten sam manifest prowadzi pytania i zapisuje odpowiedzi aktywnej sesji.</p>
              <em>Odpowiedzi zebrane</em>
            </div>
          </li>
          <li data-product-map-stage>
            <ProductMapIcon kind="score" />
            <div>
              <span>03 · Potwierdzenie</span>
              <strong>Pricing i scoring</strong>
              <p>Serwer ponownie liczy jawne, ograniczone reguły przed zapisem.</p>
              <em>Wynik potwierdzony</em>
            </div>
          </li>
        </ol>

        <span aria-hidden="true" className="product-system-map__connector">
          →
        </span>

        <section
          aria-label="Demonstracyjny rekord leada"
          className="product-lead-record"
          data-product-lead-record
        >
          <header>
            <div>
              <span>Lead pipeline</span>
              <strong>Lead L-2026-0152</strong>
            </div>
            <em>Gotowy do kontaktu</em>
          </header>
          <div className="product-lead-record__title">
            <span>Kuchnia na wymiar</span>
            <small>Nowe zapytanie · dane demonstracyjne</small>
          </div>
          <dl>
            <div>
              <dt>Budżet</dt>
              <dd>30–45 tys. zł</dd>
            </div>
            <div>
              <dt>Termin</dt>
              <dd>Do 3 miesięcy</dd>
            </div>
            <div>
              <dt>Lokalizacja</dt>
              <dd>Warszawa</dd>
            </div>
            <div>
              <dt>Załączniki</dt>
              <dd>2 pliki</dd>
            </div>
          </dl>
          <aside aria-label="Ocena dopasowania" className="product-lead-record__score">
            <div>
              <span>Dopasowanie</span>
              <strong>
                85<small>/100</small>
              </strong>
            </div>
            <ul>
              <li>Budżet zgodny z ofertą</li>
              <li>Termin realny do realizacji</li>
              <li>Zakres projektu w ofercie</li>
            </ul>
          </aside>
          <footer>
            <span>Następny krok</span>
            <strong>Przygotuj pierwszą rozmowę</strong>
          </footer>
        </section>

        <span aria-hidden="true" className="product-system-map__connector">
          →
        </span>

        <ul aria-label="Działania po zapisaniu leada" className="product-system-map__outputs">
          <li data-product-map-output>
            <ProductMapIcon kind="notification" />
            <div>
              <span>Po zapisie</span>
              <strong>Powiadomienia</strong>
              <p>Outbox oddziela zapis leada od dostawy wiadomości.</p>
            </div>
          </li>
          <li data-product-map-output>
            <ProductMapIcon kind="analytics" />
            <div>
              <span>Po zgodzie</span>
              <strong>Analityka</strong>
              <p>Agregaty pokazują konwersję i drop-off z ochroną małej próby.</p>
            </div>
          </li>
          <li className="product-system-map__decision">
            <span>Decyzja należy do firmy</span>
            <strong>System porządkuje. Handlowiec ocenia kolejny krok.</strong>
          </li>
        </ul>
      </div>

      <footer aria-label="Zasady integralności rekordu">
        <span>Jedna wersja procesu</span>
        <span>Wynik potwierdzony na serwerze</span>
        <span>Jeden uporządkowany rekord</span>
      </footer>
    </figure>
  );
}

function ProductBoundaryIcon({ kind }: { kind: "estimate" | "lead" | "rules" }) {
  if (kind === "estimate") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M7 3.5h8l3 3V20.5H7z" />
        <path d="M15 3.5v4h4M10 11h5M10 14.5h3.5" />
      </svg>
    );
  }

  if (kind === "lead") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.8 18.5c.6-3.2 2.4-4.8 5.2-4.8s4.6 1.6 5.2 4.8M16 10.5l1.5 1.5 3-3" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 7h14M5 17h14M8 4v6M16 14v6" />
      <circle cx="8" cy="7" r="2" />
      <circle cx="16" cy="17" r="2" />
    </svg>
  );
}

function ProductFinalCta() {
  return (
    <section
      aria-labelledby="product-final-cta-title"
      className="marketing-section product-final-cta"
      id="product-final-cta"
    >
      <div className="marketing-container product-final-cta__panel">
        <div className="product-final-cta__copy">
          <p className="wy-kicker marketing-eyebrow">Następny krok</p>
          <h2 id="product-final-cta-title">
            Zobacz cały proces na <span>realnym zapytaniu.</span>
          </h2>
          <p>
            Przejdź przez sześć etapów od konfiguracji do gotowego leada. Jeśli pracujesz już w
            programie pilotażowym, otwórz panel.
          </p>
          <div className="marketing-actions">
            <Link className="marketing-button" href="/jak-dziala">
              Zobacz cały proces <ArrowIcon />
            </Link>
            <Link
              className="marketing-button marketing-button--secondary"
              href="/logowanie"
              prefetch={false}
            >
              Przejdź do panelu
            </Link>
          </div>
          <ul aria-label="Zasady procesu">
            <li>Jawne reguły</li>
            <li>Wynik orientacyjny</li>
            <li>Decyzja firmy</li>
          </ul>
        </div>

        <aside aria-labelledby="product-overview-title" data-product-overview>
          <header>
            <span>Overview produktu</span>
            <strong id="product-overview-title">Kwotum w jednym widoku</strong>
          </header>
          <ol>
            <li>
              <ProductOverviewIcon kind="version" />
              <div>
                <strong>Jedna wersja procesu</strong>
                <p>Publikacja zamyka snapshot używany przez aktywną sesję.</p>
              </div>
            </li>
            <li>
              <ProductOverviewIcon kind="record" />
              <div>
                <strong>Jeden pełny rekord</strong>
                <p>Odpowiedzi, budżet, termin, pliki i powody dopasowania.</p>
              </div>
            </li>
            <li>
              <ProductOverviewIcon kind="decision" />
              <div>
                <strong>Jasna odpowiedzialność</strong>
                <p>Serwer potwierdza wynik. Firma wybiera kolejny krok.</p>
              </div>
            </li>
          </ol>
          <footer>
            <span>Cel procesu</span>
            <strong>Lepsza pierwsza rozmowa</strong>
          </footer>
        </aside>
      </div>
    </section>
  );
}

function ProductOverviewIcon({ kind }: { kind: "decision" | "record" | "version" }) {
  if (kind === "version") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M6 4.5h12v15H6zM9 8h6M9 12h6M9 16h3" />
        <path d="m14.5 15.5 1.5 1.5 3-3" />
      </svg>
    );
  }

  if (kind === "record") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5 5.5h14v14H5zM8 9h8M8 12.5h5M8 16h4" />
        <circle cx="16.5" cy="15.5" r="2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="9" cy="12" r="4" />
      <path d="m13 12 2.2 2.2L20 9.5M7.5 12l1.2 1.2L11 10.8" />
    </svg>
  );
}

function ProductMapIcon({
  kind,
}: {
  kind: "analytics" | "builder" | "notification" | "score" | "widget";
}) {
  if (kind === "builder") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M6 4.5h12v15H6zM9 8h6M9 12h3M9 16h6" />
        <circle cx="15.5" cy="12" r="1.5" />
      </svg>
    );
  }

  if (kind === "widget") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <rect height="15" rx="2" width="18" x="3" y="4.5" />
        <path d="M3 8.5h18M7 6.5h.01M10 6.5h.01M8 12h8M8 15.5h5" />
      </svg>
    );
  }

  if (kind === "score") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M5 17.5a8 8 0 1 1 14 0M12 12l4-3" />
        <circle cx="12" cy="12" r="1.5" />
      </svg>
    );
  }

  if (kind === "notification") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M7 10a5 5 0 0 1 10 0v4l2 2H5l2-2zM10 19h4" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M5 18.5v-5M10 18.5v-9M15 18.5v-4M20 18.5v-12" />
    </svg>
  );
}

function ProductFlowIcon({ kind }: { kind: "configure" | "lead" | "publish" }) {
  if (kind === "configure") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M5 4.5h14v15H5zM8 8h8M8 12h5M8 16h7" />
        <circle cx="16.5" cy="12" r="1.5" />
      </svg>
    );
  }

  if (kind === "publish") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M5 18.5h14v-8H5zM12 3.5v11M8.5 7l3.5-3.5L15.5 7" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M6 3.5h9l3 3v14H6zM15 3.5v3h3M9 11h6M9 14.5h3" />
      <path d="m13.5 17 1.5 1.5 3-3" />
    </svg>
  );
}
