import Image from "next/image";
import Link from "next/link";

import { marketingMetadata } from "../../../lib/marketing/metadata";
import styles from "./how-it-works.module.css";

export const metadata = marketingMetadata(
  "Jak Kwotum porządkuje i kwalifikuje zapytania",
  "Zobacz sześć etapów Kwotum: od konfiguracji procesu, przez sesję klienta i wynik, do uporządkowanego leada oraz decyzji firmy.",
  "/jak-dziala",
);

type JourneyStep = {
  actor: string;
  description: string;
  result: string;
  title: string;
};

const journey = [
  ["01", "Konfiguracja", "#proces"],
  ["02", "Publikacja", "#proces"],
  ["03", "Sesja klienta", "#proces-dalszy"],
  ["04", "Wynik", "#proces-dalszy"],
  ["05", "Gotowy lead", "#decyzja"],
  ["06", "Decyzja firmy", "#decyzja"],
] as const;

const preparationSteps = [
  {
    actor: "Owner lub Admin",
    description:
      "Firma ustala pytania, kolejność, warunki przejścia oraz reguły orientacyjnego wyniku.",
    result: "Kompletny szkic procesu",
    title: "Konfiguracja",
  },
  {
    actor: "Serwer Kwotum",
    description: "System sprawdza routing i zamraża opublikowaną wersję używaną przez nowe sesje.",
    result: "Niezmienna wersja procesu",
    title: "Walidacja i publikacja",
  },
] as const satisfies readonly JourneyStep[];

const clientSteps = [
  {
    actor: "Przeglądarka + serwer",
    description:
      "Klient widzi tylko właściwe pytania, a każda odpowiedź jest zapisywana i potwierdzana.",
    result: "Potwierdzony kolejny krok",
    title: "Sesja klienta",
  },
  {
    actor: "Serwer Kwotum",
    description:
      "Pricing i scoring są odtwarzane po stronie serwera; klient widzi wyłącznie dozwolony wynik.",
    result: "Bezpieczny wynik orientacyjny",
    title: "Potwierdzenie wyniku",
  },
] as const satisfies readonly JourneyStep[];

const companySteps = [
  {
    actor: "Klient + serwer",
    description:
      "Po zobaczeniu wyniku klient świadomie przekazuje kontakt i może dołączyć potrzebne materiały.",
    result: "Lead z pełnym kontekstem",
    title: "Przekazanie kontaktu",
  },
  {
    actor: "Panel firmy",
    description:
      "Zespół otrzymuje uporządkowany rekord, wybiera status i ustala właściwy następny krok.",
    result: "Decyzja pozostaje po stronie firmy",
    title: "Obsługa leada",
  },
] as const satisfies readonly JourneyStep[];

const securityLayers = [
  {
    control: "Autoryzacja + tenant scope",
    description: "Każde żądanie panelu otrzymuje po stronie serwera jawny kontekst organizacji.",
    effect: "Żądanie przypięte do organizacji",
    kind: "server",
    label: "Aplikacja i API",
    title: "Dostęp sprawdza serwer",
  },
  {
    control: "Wymuszone polityki RLS",
    description: "Rekord spoza kontekstu organizacji nie staje się danymi dostępnymi w panelu.",
    effect: "Izolacja danych organizacji",
    kind: "database",
    label: "PostgreSQL",
    title: "Baza niezależnie wymusza RLS",
  },
  {
    control: "Allowlista + magic bytes",
    description: "Rozszerzenie, MIME i sygnatura pliku są sprawdzane przed prywatnym zapisem.",
    effect: "Kontrolowany prywatny obiekt",
    kind: "file",
    label: "Pliki",
    title: "Storage pozostaje prywatny",
  },
] as const;

export default function HowItWorksPage() {
  return (
    <div className={`${styles.page} wy-marketing-v7-theme`}>
      <section
        aria-labelledby="how-it-works-title"
        className={styles.hero}
        data-how-hero
        id="how-it-works-hero"
      >
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy} data-how-hero-copy>
            <p className={styles.eyebrow}>Jak działa Kwotum</p>
            <h1 id="how-it-works-title">
              <strong>Klient przechodzi proces.</strong> <span>Firma podejmuje decyzję</span>
            </h1>
            <p className={styles.heroDescription}>
              Kwotum prowadzi klienta przez właściwe pytania, potwierdza wynik na serwerze i
              przekazuje firmie uporządkowany kontekst — bez automatycznego podejmowania decyzji
              handlowej.
            </p>
            <div className={styles.actions} data-how-actions>
              <Link className={styles.primaryAction} href="#proces">
                Zobacz sześć etapów
              </Link>
              <Link className={styles.secondaryAction} href="/produkt">
                Poznaj produkt
              </Link>
            </div>
            <ul aria-label="Najważniejsze zasady procesu" className={styles.heroFacts}>
              <li>
                <CheckGlyph /> Sześć jasnych etapów
              </li>
              <li>
                <CheckGlyph /> Wynik potwierdza serwer
              </li>
              <li>
                <CheckGlyph /> Decyzja należy do firmy
              </li>
            </ul>
          </div>

          <TrustScene />
        </div>

        <nav aria-label="Sześć etapów procesu Kwotum" className={styles.journeyRail}>
          <p>Pełna ścieżka zapytania</p>
          <ol>
            {journey.map(([number, label, href]) => (
              <li key={number}>
                <Link href={href}>
                  <span>{number}</span>
                  <strong>{label}</strong>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      <JourneyChapter
        description="Proces zaczyna się po stronie firmy. Dopiero poprawnie przygotowana i opublikowana wersja może prowadzić klienta."
        eyebrow="Etapy 1–2"
        heading={
          <>
            <strong>Najpierw firma układa logikę.</strong> <span>Serwer pilnuje publikacji</span>
          </>
        }
        id="proces"
        imageAlt="Edytor Kwotum z sekcjami procesu, podglądem formularza i ustawieniami pytania"
        imageHeight={1025}
        imageSrc="/images/product/builder-kwotum-v1.webp"
        imageWidth={1400}
        mobileHeight={600}
        mobileSrc="/images/product/builder-kwotum-mobile-v1.webp"
        startAt={1}
        steps={preparationSteps}
      />

      <JourneyChapter
        description="Przeglądarka pokazuje pytania, ale nie otrzymuje prywatnych reguł. Odpowiedzi i wynik są każdorazowo potwierdzane na serwerze."
        eyebrow="Etapy 3–4"
        heading={
          <>
            <strong>Potem klient odpowiada.</strong> <span>Kwotum potwierdza wynik</span>
          </>
        }
        id="proces-dalszy"
        imageAlt="Widok wyniku procesu Kwotum z orientacyjnym przedziałem oraz przekazaniem danych kontaktowych"
        imageHeight={1025}
        imageSrc="/images/product/widget-result-kwotum-v1.webp"
        imageWidth={1350}
        mobileHeight={600}
        mobileSrc="/images/product/widget-result-kwotum-mobile-v1.webp"
        startAt={3}
        steps={clientSteps}
        tinted
      />

      <JourneyChapter
        description="Kontakt staje się leadem dopiero po świadomym wysłaniu. Firma widzi pełny rekord i samodzielnie wybiera dalsze działanie."
        eyebrow="Etapy 5–6"
        heading={
          <>
            <strong>Na końcu powstaje brief.</strong> <span>Decyzję podejmuje firma</span>
          </>
        }
        id="decyzja"
        imageAlt="Szczegóły leada w panelu Kwotum z wynikiem, zakresem, budżetem, terminem i materiałami"
        imageHeight={1025}
        imageSrc="/images/product/lead-detail-kwotum-v1.webp"
        imageWidth={1210}
        mobileHeight={650}
        mobileSrc="/images/product/lead-detail-kwotum-mobile-v1.webp"
        startAt={5}
        steps={companySteps}
      />

      <section
        aria-labelledby="security-model-title"
        className={styles.security}
        id="bezpieczenstwo"
      >
        <header className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Bezpieczeństwo procesu</p>
          <h2 id="security-model-title">
            <strong>Jedne dane.</strong> <span>Trzy niezależne bariery dostępu</span>
          </h2>
          <p>
            Interfejs prowadzi użytkownika, ale dostęp potwierdzają niezależnie serwer, baza danych
            i prywatny storage.
          </p>
        </header>

        <div className={styles.securityBoard} data-security-board>
          <header>
            <div>
              <span>Model ochrony</span>
              <strong>Od żądania do prywatnego obiektu</strong>
            </div>
            <p>
              <SecurityGlyph kind="boundary" />
              Ukrycie kontrolki w przeglądarce nie jest autoryzacją.
            </p>
          </header>

          <ol>
            {securityLayers.map((layer, index) => (
              <li key={layer.title}>
                <div className={styles.securityLayerHeading}>
                  <span className={styles.securityIcon}>
                    <SecurityGlyph kind={layer.kind} />
                  </span>
                  <p>
                    0{index + 1} · {layer.label}
                  </p>
                  <h3>{layer.title}</h3>
                </div>
                <p>{layer.description}</p>
                <dl>
                  <div>
                    <dt>Kontrola</dt>
                    <dd>{layer.control}</dd>
                  </div>
                  <div>
                    <dt>Efekt</dt>
                    <dd>{layer.effect}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>

          <footer>
            <span>Publiczna granica</span>
            <p>
              Manifest widgetu nie zawiera pricingu, scoringu, identyfikatora tenanta ani danych
              innych sesji.
            </p>
          </footer>
        </div>
      </section>

      <HowFinalCta />
    </div>
  );
}

function TrustScene() {
  return (
    <figure aria-labelledby="trust-map-title" className={styles.trustScene} data-trust-map>
      <figcaption className="wy-sr-only" id="trust-map-title">
        Droga od wyniku klienta do uporządkowanego leada w panelu firmy
      </figcaption>
      <div className={styles.sceneGlow} />

      <div className={`${styles.sceneFrame} ${styles.clientFrame}`}>
        <ScreenChrome label="Widok klienta" />
        <Image
          alt="Orientacyjny wynik procesu widoczny dla klienta"
          className={styles.sceneDesktopImage}
          height={1025}
          priority
          sizes="(max-width: 768px) 1px, 420px"
          src="/images/product/widget-result-kwotum-v1.webp"
          width={1350}
        />
        <Image
          alt="Orientacyjny wynik procesu na telefonie"
          className={styles.sceneMobileImage}
          height={600}
          priority
          sizes="(max-width: 768px) 48vw, 1px"
          src="/images/product/widget-result-kwotum-mobile-v1.webp"
          width={390}
        />
      </div>

      <div className={styles.serverSeal}>
        <span aria-hidden="true">✓</span>
        <strong>Serwer potwierdza</strong>
        <small>wynik i zapis</small>
      </div>

      <div className={`${styles.sceneFrame} ${styles.leadFrame}`}>
        <ScreenChrome label="Panel firmy" />
        <Image
          alt="Uporządkowany rekord leada w panelu firmy"
          className={styles.sceneDesktopImage}
          height={1025}
          priority
          sizes="(max-width: 768px) 1px, 520px"
          src="/images/product/lead-detail-kwotum-v1.webp"
          width={1210}
        />
        <Image
          alt="Uporządkowany rekord leada na telefonie"
          className={styles.sceneMobileImage}
          height={650}
          priority
          sizes="(max-width: 768px) 48vw, 1px"
          src="/images/product/lead-detail-kwotum-mobile-v1.webp"
          width={390}
        />
      </div>
    </figure>
  );
}

function JourneyChapter({
  description,
  eyebrow,
  heading,
  id,
  imageAlt,
  imageHeight,
  imageSrc,
  imageWidth,
  mobileHeight,
  mobileSrc,
  startAt,
  steps,
  tinted = false,
}: {
  description: string;
  eyebrow: string;
  heading: React.ReactNode;
  id: string;
  imageAlt: string;
  imageHeight: number;
  imageSrc: string;
  imageWidth: number;
  mobileHeight: number;
  mobileSrc: string;
  startAt: number;
  steps: readonly JourneyStep[];
  tinted?: boolean;
}) {
  const titleId = `${id}-title`;

  return (
    <section
      aria-labelledby={titleId}
      className={`${styles.chapter} ${tinted ? styles.chapterTinted : ""}`}
      data-how-chapter
      id={id}
    >
      <header className={styles.sectionHeading}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{heading}</h2>
        <p>{description}</p>
      </header>

      <div className={styles.chapterBody}>
        <ol className={styles.stageList}>
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className={styles.stageNumber}>{String(startAt + index).padStart(2, "0")}</span>
              <div>
                <p>{step.actor}</p>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <footer>
                  <span>Rezultat</span>
                  <strong>{step.result}</strong>
                </footer>
              </div>
            </li>
          ))}
        </ol>

        <figure className={styles.productStage} data-how-screen>
          <div className={styles.screenWindow}>
            <ScreenChrome label="Kwotum" />
            <Image
              alt={imageAlt}
              className={styles.desktopScreenImage}
              height={imageHeight}
              loading="eager"
              sizes="(max-width: 768px) 1px, 900px"
              src={imageSrc}
              width={imageWidth}
            />
            <Image
              alt={imageAlt}
              className={styles.mobileScreenImage}
              height={mobileHeight}
              loading="eager"
              sizes="(max-width: 768px) calc(100vw - 48px), 1px"
              src={mobileSrc}
              width={390}
            />
          </div>
          <figcaption>Dane demonstracyjne</figcaption>
        </figure>
      </div>
    </section>
  );
}

function HowFinalCta() {
  return (
    <section aria-labelledby="how-final-cta-title" className={styles.finalCta} id="how-final-cta">
      <div className={styles.finalPanel}>
        <div className={styles.finalBrand}>
          <Image alt="" aria-hidden="true" height={30} src="/kwotum-logo-v3.png" width={30} />
          <strong>kwotum</strong>
        </div>
        <div className={styles.finalCopy}>
          <p className={styles.eyebrow}>Następny krok</p>
          <h2 id="how-final-cta-title">
            Wybierz branżę. <span>Zobacz właściwy brief.</span>
          </h2>
          <p>
            Mechanizm pozostaje ten sam. Zmieniają się pytania, dane wejściowe i kontekst potrzebny
            firmie przed pierwszą rozmową.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/branze">
              Porównaj branże
            </Link>
            <Link className={styles.secondaryAction} href="/logowanie" prefetch={false}>
              Przejdź do panelu
            </Link>
          </div>
        </div>

        <aside
          aria-labelledby="how-overview-title"
          className={styles.finalOverview}
          data-how-overview
        >
          <p>Stały rdzeń procesu</p>
          <h3 id="how-overview-title">Wspólny mechanizm. Branżowy kontekst.</h3>
          <dl>
            <div>
              <dt>Proces</dt>
              <dd>Sześć kontrolowanych etapów</dd>
            </div>
            <div>
              <dt>Lead</dt>
              <dd>Zakres i materiały właściwe dla usługi</dd>
            </div>
            <div>
              <dt>Decyzja</dt>
              <dd>Zawsze pozostaje po stronie firmy</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}

function ScreenChrome({ label }: { label: string }) {
  return (
    <div aria-hidden="true" className={styles.screenChrome}>
      <span>
        <i />
        <i />
        <i />
      </span>
      <strong>{label}</strong>
      <span />
    </div>
  );
}

function CheckGlyph() {
  return (
    <span aria-hidden="true" className={styles.checkGlyph}>
      <svg fill="none" viewBox="0 0 16 16">
        <path d="m3.5 8.2 2.7 2.7 6.3-6.3" />
      </svg>
    </span>
  );
}

function SecurityGlyph({ kind }: { kind: "boundary" | "database" | "file" | "server" }) {
  if (kind === "server") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <rect height="6" rx="2" width="18" x="3" y="3" />
        <rect height="6" rx="2" width="18" x="3" y="15" />
        <path d="M7 6h.01M7 18h.01M11 6h7M11 18h7M12 9v6" />
      </svg>
    );
  }

  if (kind === "database") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
        <path d="m9.5 11.3 1.7 1.7 3.6-4" />
      </svg>
    );
  }

  if (kind === "file") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M6 3h8l4 4v14H6zM14 3v5h5" />
        <path d="m9 14 2 2 4-5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M12 3 5 6v5c0 4.7 2.8 8.4 7 10 4.2-1.6 7-5.3 7-10V6z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  );
}
