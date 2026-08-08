import Link from "next/link";
import { marketingMetadata } from "../../../lib/marketing/metadata";
import { Breadcrumbs } from "../components";
import { ResponsiveDisclosureController } from "./responsive-disclosure-controller";

export const metadata = marketingMetadata(
  "Jak Kwotum porządkuje i kwalifikuje zapytania",
  "Od szablonu i publikacji przez sesję klienta do serwerowego wyniku, uporządkowanego leada, powiadomień i analityki.",
  "/jak-dziala",
);

export default function HowItWorksPage() {
  return (
    <>
      <ResponsiveDisclosureController />
      <section
        aria-labelledby="how-it-works-title"
        className="how-it-works-hero"
        id="how-it-works-hero"
      >
        <div className="marketing-container how-it-works-hero__inner">
          <Breadcrumbs items={[{ href: "/", label: "Start" }, { label: "Jak działa" }]} />
          <div className="how-it-works-hero__layout">
            <div className="how-it-works-hero__copy" data-how-hero-copy>
              <p className="wy-kicker marketing-eyebrow">Jak działa</p>
              <h1 id="how-it-works-title">
                Klient przechodzi proces. <span>Firma podejmuje decyzję.</span>
              </h1>
              <p>
                Kwotum rozdziela to, co dzieje się w przeglądarce, na serwerze i w panelu. Dzięki
                temu odpowiedzi prowadzą do uporządkowanego leada, ale wynik nie staje się
                automatyczną decyzją handlową.
              </p>
              <div className="marketing-actions">
                <Link className="marketing-button" href="#proces">
                  Zobacz sześć etapów
                  <svg aria-hidden="true" viewBox="0 0 20 20">
                    <path d="m5 7 5 5 5-5" />
                  </svg>
                </Link>
                <Link className="marketing-button marketing-button--secondary" href="/produkt">
                  Poznaj produkt
                </Link>
              </div>
              <p className="how-it-works-hero__boundary">
                <strong>Granica:</strong> przeglądarka nie oblicza samodzielnie ceny ani score.
              </p>
            </div>

            <figure aria-labelledby="trust-map-title" className="trust-map" data-trust-map>
              <header>
                <div>
                  <span>Mapa zaufania</span>
                  <h2 id="trust-map-title">Co dzieje się gdzie?</h2>
                </div>
                <p>Jedna ścieżka, trzy odpowiedzialności</p>
              </header>

              <ol>
                <li>
                  <TrustMapIcon kind="browser" />
                  <span className="trust-map__number">01 · Przeglądarka</span>
                  <strong>Prowadzi klienta</strong>
                  <details className="trust-map__details" open>
                    <summary className="trust-map__limit">Nie zna prywatnych reguł</summary>
                    <p>Pokazuje pytania i przesyła odpowiedzi do potwierdzenia.</p>
                  </details>
                </li>
                <li className="trust-map__server">
                  <TrustMapIcon kind="server" />
                  <span className="trust-map__number">02 · Serwer</span>
                  <strong>Potwierdza wynik</strong>
                  <details className="trust-map__details" open>
                    <summary className="trust-map__limit">Źródło wyniku i dostępu</summary>
                    <p>Odtwarza opublikowaną wersję, pricing i scoring.</p>
                  </details>
                </li>
                <li>
                  <TrustMapIcon kind="panel" />
                  <span className="trust-map__number">03 · Panel firmy</span>
                  <strong>Porządkuje kontekst</strong>
                  <details className="trust-map__details" open>
                    <summary className="trust-map__limit">Decyzja należy do firmy</summary>
                    <p>Pokazuje pełny rekord i pozwala wybrać kolejny krok.</p>
                  </details>
                </li>
              </ol>

              <figcaption>
                <span>Wynik orientacyjny</span>
                <strong>Nie jest ofertą, pomiarem ani decyzją firmy.</strong>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="process-first-half-title"
        className="marketing-section process-first-half"
        id="proces"
      >
        <div className="marketing-container">
          <header className="process-first-half__heading">
            <div>
              <p className="wy-kicker marketing-eyebrow">Etapy 1–3</p>
              <h2 id="process-first-half-title">
                Proces zaczyna się, zanim klient zobaczy pierwsze pytanie.
              </h2>
            </div>
            <p>
              Najpierw firma przygotowuje logikę. Potem serwer sprawdza i zamraża wersję, a dopiero
              wtedy przeglądarka prowadzi klienta przez właściwe pytania.
            </p>
          </header>

          <ol className="process-first-half__steps">
            <li className="process-stage-card">
              <header className="process-stage-card__header">
                <ProcessStageIcon kind="configure" />
                <div>
                  <span className="process-stage-card__number">01 · Panel firmy</span>
                  <strong>Owner lub Admin</strong>
                </div>
              </header>
              <h3>Konfiguracja</h3>
              <details className="process-stage-card__details" open>
                <summary>
                  <span>Opis i dane etapu</span>
                  <strong>Kompletny szkic procesu</strong>
                </summary>
                <p>
                  Firma wybiera szablon, pytania i warunki oraz ustala pricing, scoring i treści
                  zgód.
                </p>
                <div aria-label="Przykładowa konfiguracja" className="process-stage-card__artifact">
                  <span className="process-stage-card__demo">Dane przykładowe</span>
                  <dl>
                    <div>
                      <dt>Pytania</dt>
                      <dd>18</dd>
                    </div>
                    <div>
                      <dt>Warunki</dt>
                      <dd>5</dd>
                    </div>
                    <div>
                      <dt>Stan</dt>
                      <dd>Szkic</dd>
                    </div>
                  </dl>
                </div>
              </details>
              <footer>
                <span>Rezultat</span>
                <strong>Kompletny szkic procesu</strong>
              </footer>
            </li>

            <li className="process-stage-card process-stage-card--server">
              <header className="process-stage-card__header">
                <ProcessStageIcon kind="publish" />
                <div>
                  <span className="process-stage-card__number">02 · Serwer</span>
                  <strong>Walidacja systemowa</strong>
                </div>
              </header>
              <h3>Walidacja i publikacja</h3>
              <details className="process-stage-card__details" open>
                <summary>
                  <span>Opis i dane etapu</span>
                  <strong>Niezmienna wersja procesu</strong>
                </summary>
                <p>
                  System wykrywa pętle i martwe ścieżki. Publikacja zamraża wersję z własnym hashem.
                </p>
                <div
                  aria-label="Przykładowy raport publikacji"
                  className="process-stage-card__artifact"
                >
                  <span className="process-stage-card__demo">Dane przykładowe</span>
                  <ul>
                    <li>
                      <span>Routing sprawdzony</span>
                      <strong>Gotowe</strong>
                    </li>
                    <li>
                      <span>Treści zgód</span>
                      <strong>Przypięte</strong>
                    </li>
                    <li>
                      <span>Wersja</span>
                      <strong>4 · opublikowana</strong>
                    </li>
                  </ul>
                </div>
              </details>
              <footer>
                <span>Rezultat</span>
                <strong>Niezmienna wersja procesu</strong>
              </footer>
            </li>

            <li className="process-stage-card">
              <header className="process-stage-card__header">
                <ProcessStageIcon kind="session" />
                <div>
                  <span className="process-stage-card__number">03 · Przeglądarka + serwer</span>
                  <strong>Widget + serwer</strong>
                </div>
              </header>
              <h3>Sesja klienta</h3>
              <details className="process-stage-card__details" open>
                <summary>
                  <span>Opis i dane etapu</span>
                  <strong>Potwierdzony kolejny krok</strong>
                </summary>
                <p>
                  Widget pokazuje kolejny krok, a serwer zapisuje odpowiedź i potwierdza routing
                  przypiętej wersji.
                </p>
                <div aria-label="Przykładowy krok sesji" className="process-stage-card__artifact">
                  <span className="process-stage-card__demo">Dane przykładowe</span>
                  <div className="process-stage-card__progress">
                    <span>Krok 3 z 7</span>
                    <span aria-hidden="true">43%</span>
                  </div>
                  <div aria-hidden="true" className="process-stage-card__progress-bar">
                    <span />
                  </div>
                  <p>
                    Budżet projektu
                    <strong>30 000–45 000 zł</strong>
                  </p>
                  <span className="process-stage-card__saved">Odpowiedź zapisana</span>
                </div>
              </details>
              <footer>
                <span>Rezultat</span>
                <strong>Potwierdzony kolejny krok</strong>
              </footer>
            </li>
          </ol>

          <p className="process-first-half__boundary">
            <strong>Granica zaufania:</strong> przeglądarka prowadzi sesję, ale nie otrzymuje
            prywatnych reguł pricingu ani scoringu.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="process-second-half-title"
        className="marketing-section process-second-half"
        id="proces-dalszy"
      >
        <div className="marketing-container process-second-half__layout">
          <header className="process-second-half__intro">
            <p className="wy-kicker marketing-eyebrow">Etapy 4–6</p>
            <h2 id="process-second-half-title">
              Odpowiedzi prowadzą do decyzji firmy. Nie zastępują jej.
            </h2>
            <p>
              Serwer potwierdza wynik, klient świadomie przekazuje kontakt, a firma otrzymuje
              uporządkowany rekord i wybiera dalsze działanie.
            </p>
            <div className="process-second-half__boundary">
              <span>Granica wyniku</span>
              <strong>Wynik jest orientacyjny, a prywatny score pozostaje w panelu.</strong>
            </div>
          </header>

          <ol className="process-second-half__steps" start={4}>
            <li className="process-outcome-card">
              <header className="process-outcome-card__header">
                <ProcessOutcomeIcon kind="result" />
                <div>
                  <span>04 · Serwer</span>
                  <strong>Potwierdzenie wyniku</strong>
                </div>
              </header>
              <div className="process-outcome-card__copy">
                <h3>Bezpieczny wynik dla klienta</h3>
                <p className="process-outcome-card__desktop-description">
                  Serwer odtwarza pricing i scoring z zapisanych odpowiedzi. Publicznie pokazuje
                  tylko dozwoloną część wyniku.
                </p>
              </div>
              <details className="process-outcome-card__details" open>
                <summary>
                  <span>Opis i dane etapu</span>
                  <strong>Klient widzi bezpieczny zakres</strong>
                </summary>
                <p className="process-outcome-card__mobile-description">
                  Serwer odtwarza pricing i scoring z zapisanych odpowiedzi. Publicznie pokazuje
                  tylko dozwoloną część wyniku.
                </p>
                <div aria-label="Przykładowy wynik" className="process-outcome-card__artifact">
                  <span className="process-outcome-card__demo">Dane przykładowe</span>
                  <div className="process-outcome-card__price">
                    <span>Wynik orientacyjny</span>
                    <strong>30–45 tys. zł</strong>
                  </div>
                  <span className="process-outcome-card__confirmed">Potwierdzone przez serwer</span>
                </div>
              </details>
              <footer>
                <span>Rezultat</span>
                <strong>Klient widzi bezpieczny zakres</strong>
              </footer>
            </li>

            <li className="process-outcome-card">
              <header className="process-outcome-card__header">
                <ProcessOutcomeIcon kind="lead" />
                <div>
                  <span>05 · Klient + serwer</span>
                  <strong>Świadome przekazanie</strong>
                </div>
              </header>
              <div className="process-outcome-card__copy">
                <h3>Kontakt staje się leadem</h3>
                <p className="process-outcome-card__desktop-description">
                  Po zobaczeniu wartości klient podaje minimalny kontakt, potwierdza informację
                  prywatności i opcjonalnie dodaje pliki.
                </p>
              </div>
              <details className="process-outcome-card__details" open>
                <summary>
                  <span>Opis i dane etapu</span>
                  <strong>Lead z pełnym kontekstem</strong>
                </summary>
                <p className="process-outcome-card__mobile-description">
                  Po zobaczeniu wartości klient podaje minimalny kontakt, potwierdza informację
                  prywatności i opcjonalnie dodaje pliki.
                </p>
                <div
                  aria-label="Przykładowy zapis leada"
                  className="process-outcome-card__artifact"
                >
                  <span className="process-outcome-card__demo">Dane przykładowe</span>
                  <dl>
                    <div>
                      <dt>Kontakt</dt>
                      <dd>E-mail</dd>
                    </div>
                    <div>
                      <dt>Załączniki</dt>
                      <dd>2 pliki</dd>
                    </div>
                    <div>
                      <dt>Prywatność</dt>
                      <dd>Potwierdzenie v1</dd>
                    </div>
                  </dl>
                </div>
              </details>
              <footer>
                <span>Rezultat</span>
                <strong>Lead z pełnym kontekstem</strong>
              </footer>
            </li>

            <li className="process-outcome-card">
              <header className="process-outcome-card__header">
                <ProcessOutcomeIcon kind="action" />
                <div>
                  <span>06 · Panel firmy</span>
                  <strong>Obsługa i pomiar</strong>
                </div>
              </header>
              <div className="process-outcome-card__copy">
                <h3>Firma wybiera następny krok</h3>
                <p className="process-outcome-card__desktop-description">
                  Zespół otrzymuje powiadomienie, aktualizuje status leada i obserwuje agregowaną
                  analitykę procesu.
                </p>
              </div>
              <details className="process-outcome-card__details" open>
                <summary>
                  <span>Opis i dane etapu</span>
                  <strong>Decyzja pozostaje po stronie firmy</strong>
                </summary>
                <p className="process-outcome-card__mobile-description">
                  Zespół otrzymuje powiadomienie, aktualizuje status leada i obserwuje agregowaną
                  analitykę procesu.
                </p>
                <div
                  aria-label="Przykładowa obsługa leada"
                  className="process-outcome-card__artifact"
                >
                  <span className="process-outcome-card__demo">Dane przykładowe</span>
                  <dl>
                    <div>
                      <dt>Status</dt>
                      <dd>Gotowy do kontaktu</dd>
                    </div>
                    <div>
                      <dt>Następny krok</dt>
                      <dd>Rozmowa</dd>
                    </div>
                    <div>
                      <dt>Pomiar</dt>
                      <dd>Dane agregowane</dd>
                    </div>
                  </dl>
                </div>
              </details>
              <footer>
                <span>Rezultat</span>
                <strong>Decyzja pozostaje po stronie firmy</strong>
              </footer>
            </li>
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="security-model-title"
        className="marketing-section security-model"
        id="bezpieczenstwo"
      >
        <div className="marketing-container security-model__layout">
          <header className="security-model__intro">
            <p className="wy-kicker marketing-eyebrow">Bezpieczeństwo procesu</p>
            <h2 id="security-model-title">Jedne dane. Trzy niezależne bariery dostępu.</h2>
            <p>
              Każda warstwa sprawdza własny fragment ścieżki. Interfejs prowadzi użytkownika, ale
              dostęp potwierdzają serwer, baza i prywatny storage.
            </p>
            <aside className="security-model__principle">
              <SecurityLayerIcon kind="boundary" />
              <div>
                <span>Zasada bezpieczeństwa</span>
                <strong>Ukrycie kontrolki w przeglądarce nie jest autoryzacją.</strong>
              </div>
            </aside>
          </header>

          <div className="security-model__board">
            <header className="security-model__board-header">
              <div>
                <span>Model ochrony</span>
                <h3>Od żądania do prywatnego obiektu</h3>
              </div>
              <span className="security-model__status">Ochrona warstwowa</span>
            </header>

            <ol className="security-model__layers">
              <li>
                <div className="security-model__layer-heading">
                  <SecurityLayerIcon kind="server" />
                  <div>
                    <span>01 · Aplikacja i API</span>
                    <h3>Dostęp sprawdza serwer</h3>
                  </div>
                </div>
                <details className="security-model__details" open>
                  <summary>
                    <span>Kontrola i efekt</span>
                    <strong>Żądanie przypięte do organizacji</strong>
                  </summary>
                  <p>
                    Autoryzacja działa po stronie serwera, a każde żądanie panelu otrzymuje jawny
                    kontekst organizacji.
                  </p>
                  <dl>
                    <div>
                      <dt>Kontrola</dt>
                      <dd>Autoryzacja + tenant scope</dd>
                    </div>
                  </dl>
                  <footer>
                    <span>Efekt</span>
                    <strong>Żądanie przypięte do organizacji</strong>
                  </footer>
                </details>
              </li>

              <li>
                <div className="security-model__layer-heading">
                  <SecurityLayerIcon kind="database" />
                  <div>
                    <span>02 · PostgreSQL</span>
                    <h3>Baza niezależnie wymusza RLS</h3>
                  </div>
                </div>
                <details className="security-model__details" open>
                  <summary>
                    <span>Kontrola i efekt</span>
                    <strong>Izolacja danych organizacji</strong>
                  </summary>
                  <p>
                    Polityki dostępu są wymuszone w bazie. Rekord spoza kontekstu organizacji nie
                    staje się danymi panelu.
                  </p>
                  <dl>
                    <div>
                      <dt>Kontrola</dt>
                      <dd>Wymuszone polityki RLS</dd>
                    </div>
                  </dl>
                  <footer>
                    <span>Efekt</span>
                    <strong>Izolacja danych organizacji</strong>
                  </footer>
                </details>
              </li>

              <li>
                <div className="security-model__layer-heading">
                  <SecurityLayerIcon kind="file" />
                  <div>
                    <span>03 · Pliki</span>
                    <h3>Storage pozostaje prywatny</h3>
                  </div>
                </div>
                <details className="security-model__details" open>
                  <summary>
                    <span>Kontrola i efekt</span>
                    <strong>Kontrolowany prywatny obiekt</strong>
                  </summary>
                  <p>
                    Rozszerzenie, MIME i sygnatura pliku są sprawdzane przed zapisem na losowej,
                    prywatnej ścieżce.
                  </p>
                  <dl>
                    <div>
                      <dt>Kontrola</dt>
                      <dd>Allowlista + magic bytes</dd>
                    </div>
                  </dl>
                  <footer>
                    <span>Efekt</span>
                    <strong>Kontrolowany prywatny obiekt</strong>
                  </footer>
                </details>
              </li>
            </ol>

            <div className="security-model__public-boundary">
              <span>Publiczna granica</span>
              <p>
                Manifest widgetu nie zawiera pricingu, scoringu, identyfikatora tenanta ani danych
                innych sesji.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HowFinalCta />
    </>
  );
}

function HowFinalCta() {
  return (
    <section
      aria-labelledby="how-final-cta-title"
      className="marketing-section how-final-cta"
      id="how-final-cta"
    >
      <div className="marketing-container how-final-cta__panel">
        <div className="how-final-cta__copy">
          <p className="wy-kicker marketing-eyebrow">Następny krok</p>
          <h2 id="how-final-cta-title">
            Wybierz branżę. <span>Zobacz właściwy brief.</span>
          </h2>
          <p>
            Sześć etapów pozostaje wspólnych. Zmieniają się pytania, dane wejściowe i kontekst,
            którego firma potrzebuje przed pierwszą rozmową.
          </p>
          <div className="marketing-actions">
            <Link className="marketing-button how-final-cta__primary" href="/branze">
              Porównaj branże
              <svg aria-hidden="true" viewBox="0 0 20 20">
                <path d="M4 10h12m-4-4 4 4-4 4" />
              </svg>
            </Link>
            <Link
              className="marketing-button how-final-cta__secondary"
              href="/logowanie"
              prefetch={false}
            >
              Przejdź do panelu
            </Link>
          </div>
          <ul aria-label="Zasady przejścia do branż">
            <li>Ten sam bezpieczny mechanizm</li>
            <li>Pytania dopasowane do usługi</li>
            <li>Decyzja nadal po stronie firmy</li>
          </ul>
        </div>

        <aside aria-labelledby="how-overview-title" data-how-overview>
          <details className="how-overview__details" open>
            <summary>
              <span>Overview procesu</span>
              <strong id="how-overview-title">Stały rdzeń. Branżowy kontekst.</strong>
            </summary>
            <ol>
              <li>
                <HowOverviewIcon kind="process" />
                <div>
                  <span>Wspólne</span>
                  <strong>Sześć etapów procesu</strong>
                </div>
                <div>
                  <span>Zależne od usługi</span>
                  <strong>Pytania i warunki</strong>
                </div>
              </li>
              <li>
                <HowOverviewIcon kind="record" />
                <div>
                  <span>Wspólne</span>
                  <strong>Uporządkowany lead</strong>
                </div>
                <div>
                  <span>Zależne od usługi</span>
                  <strong>Zakres i materiały</strong>
                </div>
              </li>
              <li>
                <HowOverviewIcon kind="decision" />
                <div>
                  <span>Wspólne</span>
                  <strong>Decyzja firmy</strong>
                </div>
                <div>
                  <span>Zależne od usługi</span>
                  <strong>Właściwy następny krok</strong>
                </div>
              </li>
            </ol>
            <footer>
              <span>Efekt</span>
              <strong>Brief gotowy do pierwszej rozmowy</strong>
            </footer>
          </details>
        </aside>
      </div>
    </section>
  );
}

function HowOverviewIcon({ kind }: { kind: "decision" | "process" | "record" }) {
  if (kind === "process") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="6" r="2" />
        <circle cx="19" cy="12" r="2" />
        <path d="m7 11 3.2-3.5M13.8 7.5 17 11M7 13h10" />
      </svg>
    );
  }

  if (kind === "record") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5 4h14v16H5zM8 8h8M8 12h5M8 16h6" />
        <path d="m15 15 1.5 1.5 3-3" />
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

function SecurityLayerIcon({ kind }: { kind: "boundary" | "database" | "file" | "server" }) {
  if (kind === "server") {
    return (
      <svg aria-hidden="true" className="security-model__icon" viewBox="0 0 24 24">
        <rect height="6" rx="2" width="18" x="3" y="3" />
        <rect height="6" rx="2" width="18" x="3" y="15" />
        <path d="M7 6h.01M7 18h.01M11 6h7M11 18h7M12 9v6" />
      </svg>
    );
  }

  if (kind === "database") {
    return (
      <svg aria-hidden="true" className="security-model__icon" viewBox="0 0 24 24">
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
        <path d="m9.5 11.3 1.7 1.7 3.6-4" />
      </svg>
    );
  }

  if (kind === "file") {
    return (
      <svg aria-hidden="true" className="security-model__icon" viewBox="0 0 24 24">
        <path d="M6 3h8l4 4v14H6zM14 3v5h5" />
        <path d="m9 14 2 2 4-5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="security-model__principle-icon" viewBox="0 0 24 24">
      <path d="M12 3 5 6v5c0 4.7 2.8 8.4 7 10 4.2-1.6 7-5.3 7-10V6z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  );
}

function TrustMapIcon({ kind }: { kind: "browser" | "panel" | "server" }) {
  if (kind === "browser") {
    return (
      <svg aria-hidden="true" className="trust-map__icon" viewBox="0 0 24 24">
        <rect height="14" rx="2" width="18" x="3" y="4" />
        <path d="M3 8h18M9 21h6M12 18v3" />
        <circle cx="6" cy="6" r=".5" />
      </svg>
    );
  }

  if (kind === "server") {
    return (
      <svg aria-hidden="true" className="trust-map__icon" viewBox="0 0 24 24">
        <rect height="6" rx="2" width="18" x="3" y="3" />
        <rect height="6" rx="2" width="18" x="3" y="15" />
        <path d="M7 6h.01M7 18h.01M11 6h7M11 18h7M12 9v6" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="trust-map__icon" viewBox="0 0 24 24">
      <path d="M4 4h16v16H4zM4 9h16M9 9v11" />
      <path d="m12.5 15 2 2 4-5" />
    </svg>
  );
}

function ProcessStageIcon({ kind }: { kind: "configure" | "publish" | "session" }) {
  if (kind === "configure") {
    return (
      <svg aria-hidden="true" className="process-stage-card__icon" viewBox="0 0 24 24">
        <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5" />
        <circle cx="16" cy="6" r="2" />
        <circle cx="8" cy="12" r="2" />
        <circle cx="13" cy="18" r="2" />
      </svg>
    );
  }

  if (kind === "publish") {
    return (
      <svg aria-hidden="true" className="process-stage-card__icon" viewBox="0 0 24 24">
        <path d="M12 16V4m0 0L8 8m4-4 4 4M5 13v6h14v-6" />
        <path d="m8 13 2 2 5-5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="process-stage-card__icon" viewBox="0 0 24 24">
      <rect height="16" rx="2" width="12" x="6" y="4" />
      <path d="M9 8h6M9 12h4M10 17h4" />
      <path d="m15.5 14.5 1.2 1.2 2.3-2.7" />
    </svg>
  );
}

function ProcessOutcomeIcon({ kind }: { kind: "action" | "lead" | "result" }) {
  if (kind === "result") {
    return (
      <svg aria-hidden="true" className="process-outcome-card__icon" viewBox="0 0 24 24">
        <path d="M4 18V9m5 9V5m5 13v-7m5 7V7" />
        <path d="m4 5 4 3 5-5 7 4" />
      </svg>
    );
  }

  if (kind === "lead") {
    return (
      <svg aria-hidden="true" className="process-outcome-card__icon" viewBox="0 0 24 24">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.6-3.2 2.4-5 5.5-5s4.9 1.8 5.5 5" />
        <path d="m15 11 2 2 4-5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="process-outcome-card__icon" viewBox="0 0 24 24">
      <path d="M4 5h16v14H4zM4 9h16M8 5v4" />
      <path d="m8 14 2 2 5-5" />
    </svg>
  );
}
