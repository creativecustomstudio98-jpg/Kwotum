import Image from "next/image";
import Link from "next/link";

import { marketingMetadata } from "../../../lib/marketing/metadata";
import styles from "./agency-page.module.css";

export const metadata = marketingMetadata(
  "Formularze wyceny dla agencji WordPress i web",
  "Projektuj prowadzone formularze dla firm usługowych, publikuj wersje i przekazuj klientom uporządkowane leady bez logiki kopiowanej między stronami.",
  "/dla-agencji",
);

const sectionNavigation = [
  ["01", "Model wdrożenia", "#model-wdrozenia"],
  ["02", "Granica danych", "#granica-danych"],
  ["03", "Izolacja widgetu", "#izolacja-widgetu"],
  ["04", "Następny krok", "#agency-final-cta"],
] as const;

const responsibilities = [
  ["Agencja", "Warsztat, konfiguracja i publikacja"],
  ["Firma klienta", "Role, leady i codzienna obsługa"],
  ["Dostęp", "Wyłącznie przez aktywne członkostwo"],
] as const;

const implementationStages = [
  {
    description: "Ustalamy decyzje potrzebne sprzedawcy i usuwamy pytania bez dalszego działania.",
    label: "Agencja + firma",
    result: "Mapa pytań i odpowiedzialności",
    title: "Warsztat",
  },
  {
    description:
      "Agencja ustawia warunki, przedziały, score i treści w wersjonowanej konfiguracji.",
    label: "Agencja",
    result: "Proces gotowy do wspólnego testu",
    title: "Konfiguracja",
  },
  {
    description:
      "Widget albo hosted link trafia na stronę i przechodzi kontrolę mobile oraz klawiatury.",
    label: "Agencja",
    result: "Sprawdzony kanał pozyskania leada",
    title: "Osadzenie",
  },
  {
    description: "Firma przejmuje obsługę zapytań, a kolejne zmiany powstają jako nowe wersje.",
    label: "Firma klienta",
    result: "Leady w jej organizacji i rolach",
    title: "Przekazanie",
  },
] as const;

const methodContract = [
  ["Architektura", "Wspólna dla wdrożeń"],
  ["Treść i logika", "Dopasowane do firmy"],
  ["Dane i dostęp", "W organizacji klienta"],
] as const;

const leadPermissions = [
  ["Czytanie leadów", true, true, true],
  ["Status, notatki i obsługa", true, true, true],
  ["Przypisanie właściciela", true, true, false],
  ["Eksport i retencja", true, false, false],
] as const;

const accessLayers = [
  ["Aktywna organizacja", "Każda operacja wskazuje organizację z adresu panelu."],
  ["TenantContext", "Serwer sprawdza użytkownika, członkostwo i rolę."],
  ["RLS", "Baza ponownie odcina zasoby innej organizacji."],
] as const;

const isolationContract = [
  ["Mały loader", "Renderer ładuje się dopiero, gdy element pojawi się na stronie."],
  ["Własne style", "Kontrolki korzystają z arkusza wewnątrz Shadow DOM."],
  ["Wąski kontrakt", "Host nie otrzymuje odpowiedzi ani tokenu sesji."],
] as const;

export default function AgencyPage() {
  return (
    <div className={`${styles.page} wy-marketing-v7-theme`}>
      <section
        aria-labelledby="agency-hero-title"
        className={styles.hero}
        data-agency-hero
        id="agency-hero"
      >
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy} data-agency-hero-copy>
            <p className={styles.eyebrow}>Dla agencji</p>
            <h1 className="wy-marketing-heading-1" id="agency-hero-title">
              <strong>Wdrażacie proces.</strong>
              <span>Klient zarządza leadami.</span>
            </h1>
            <p className={`${styles.heroDescription} wy-marketing-lead`}>
              Agencja projektuje pytania, konfiguruje proces i publikuje go na stronie. Firma
              otrzymuje kompletne zapytania we własnej organizacji — bez automatycznego dostępu
              wykonawcy do leadów.
            </p>
            <div className={styles.actions} data-agency-actions>
              <Link className={styles.primaryAction} href="#model-wdrozenia">
                Zobacz model wdrożenia
              </Link>
              <Link className={styles.secondaryAction} href="/branze">
                Porównaj branże
              </Link>
            </div>
            <ul aria-label="Najważniejsze zasady współpracy" className={styles.heroFacts}>
              <li>
                <CheckGlyph /> Jedna metoda wdrożenia
              </li>
              <li>
                <CheckGlyph /> Oddzielny tenant klienta
              </li>
              <li>
                <CheckGlyph /> Kontrolowane przekazanie
              </li>
            </ul>
          </div>

          <AgencyHeroScene />
        </div>

        <nav aria-label="Rozdziały dla agencji" className={styles.sectionRail}>
          <p>Od warsztatu do przekazania</p>
          <ol>
            {sectionNavigation.map(([number, label, href]) => (
              <li key={href}>
                <Link href={href}>
                  <span>{number}</span>
                  <strong>{label}</strong>
                  <i aria-hidden="true">→</i>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      <section
        aria-labelledby="agency-method-title"
        className={`${styles.section} ${styles.method}`}
        data-agency-method
        id="model-wdrozenia"
      >
        <SectionHeading
          description="Powtarzamy kolejność pracy, nie zestaw pytań. Zakres i logika powstają dla konkretnej firmy, a odpowiedzialność zmienia się przy przekazaniu."
          eyebrow="Model wdrożenia"
          id="agency-method-title"
          title={
            <>
              <strong>Jedna metoda wdrożenia.</strong>
              <span>Każdy proces dopasowany do klienta.</span>
            </>
          }
        />

        <div className={styles.methodLayout} data-agency-method-board>
          <ProductScreen
            alt="Edytor procesu Kwotum używany do konfiguracji pytań i reguł klienta"
            desktopHeight={1025}
            desktopSrc="/images/product/builder-kwotum-v1.webp"
            desktopWidth={1400}
            label="Konfiguracja procesu"
            mobileHeight={600}
            mobileSrc="/images/product/builder-kwotum-mobile-v1.webp"
          />

          <ol aria-label="Cztery etapy wdrożenia Kwotum" className={styles.methodSteps}>
            {implementationStages.map((stage, index) => (
              <li data-agency-method-step key={stage.title}>
                <span className={styles.stepNumber}>0{index + 1}</span>
                <div>
                  <p>{stage.label}</p>
                  <h3 className="wy-marketing-heading-3">{stage.title}</h3>
                  <span className="wy-marketing-body">{stage.description}</span>
                  <small>
                    Rezultat <strong>{stage.result}</strong>
                  </small>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <dl
          aria-label="Stały kontrakt wdrożenia"
          className={styles.factRail}
          data-agency-method-rules
        >
          {methodContract.map(([term, description], index) => (
            <div key={term}>
              <dt>
                <span>0{index + 1}</span>
                <strong>{term}</strong>
              </dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="agency-ownership-title"
        className={`${styles.section} ${styles.ownership}`}
        data-agency-ownership
        id="granica-danych"
      >
        <SectionHeading
          description="Proces może przygotować agencja, ale zapytania trafiają do organizacji klienta. Role sprawdza serwer, a granicę tenanta ponownie egzekwuje baza."
          eyebrow="Granica danych"
          id="agency-ownership-title"
          title={
            <>
              <strong>Lead należy do firmy.</strong>
              <span>Dostęp wynika z roli, nie z wdrożenia.</span>
            </>
          }
        />

        <div className={styles.ownershipLayout}>
          <ProductScreen
            alt="Szczegóły leada w organizacji klienta z zakresem, budżetem i terminem"
            desktopHeight={1025}
            desktopSrc="/images/product/lead-detail-kwotum-v1.webp"
            desktopWidth={1210}
            label="Rekord w organizacji klienta"
            mobileHeight={650}
            mobileSrc="/images/product/lead-detail-kwotum-mobile-v1.webp"
          />

          <div className={styles.accessProof} data-agency-access-proof>
            <div className={styles.accessHeading}>
              <p>Aktywna organizacja klienta</p>
              <h3 className="wy-marketing-heading-3">Uprawnienia wynikają z członkostwa</h3>
              <span>Owner · Admin · Sales</span>
            </div>

            <table>
              <caption className="wy-sr-only">
                Uprawnienia aktywnych ról organizacji do operacji na leadach
              </caption>
              <thead>
                <tr>
                  <th scope="col">Operacja</th>
                  <th scope="col">Owner</th>
                  <th scope="col">Admin</th>
                  <th scope="col">Sales</th>
                </tr>
              </thead>
              <tbody>
                {leadPermissions.map(([label, owner, admin, sales]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    <PermissionCell allowed={owner} role="Owner" />
                    <PermissionCell allowed={admin} role="Admin" />
                    <PermissionCell allowed={sales} role="Sales" />
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.agencyBoundary} data-agency-boundary>
              <span>Agencja wdrożeniowa</span>
              <strong>Poza organizacją domyślnie</strong>
              <p>Samo wdrożenie nie nadaje roli ani dostępu do leadów.</p>
            </div>
          </div>
        </div>

        <ol aria-label="Warstwy kontroli tenantowej" className={styles.accessLayers}>
          {accessLayers.map(([title, description], index) => (
            <li key={title}>
              <span>0{index + 1}</span>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="agency-isolation-title"
        className={styles.isolation}
        data-agency-isolation
        id="izolacja-widgetu"
      >
        <div className={styles.isolationGrid} data-agency-isolation-proof>
          <div className={styles.isolationCopy}>
            <p className={styles.darkEyebrow}>Izolacja interfejsu</p>
            <h2 className="wy-marketing-heading-2" id="agency-isolation-title">
              <strong>Motyw klienta zostaje na zewnątrz.</strong>
              <span>Widget zachowuje własny interfejs.</span>
            </h2>
            <p className="wy-marketing-lead">
              Natywny element korzysta z własnego arkusza wewnątrz Shadow DOM. Globalny CSS strony
              nie zmienia kontrolek formularza, ale Shadow DOM nie jest granicą bezpieczeństwa dla
              JavaScriptu hosta.
            </p>

            <code>&lt;wyceno-widget mode=&quot;inline&quot;&gt;</code>
            <div className={styles.shadowBoundary}>
              <span>Shadow root</span>
              <strong>Style hosta zatrzymane</strong>
            </div>

            <ol aria-label="Kontrakt izolacji widgetu" className={styles.isolationFacts}>
              {isolationContract.map(([title, description], index) => (
                <li key={title}>
                  <span>0{index + 1}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <ProductScreen
            alt="Widok formularza Kwotum działającego w izolowanym interfejsie widgetu"
            dark
            desktopHeight={1025}
            desktopSrc="/images/product/widget-result-kwotum-v1.webp"
            desktopWidth={1350}
            label="Widget Kwotum · dane demonstracyjne"
            mobileHeight={600}
            mobileSrc="/images/product/widget-result-kwotum-mobile-v1.webp"
          />
        </div>
      </section>

      <AgencyFinalCta />
    </div>
  );
}

function AgencyHeroScene() {
  return (
    <figure className={styles.heroScene} data-agency-tenant-proof>
      <div aria-hidden="true" className={styles.sceneGlow} />
      <div className={styles.dashboardFrame} data-agency-panel-preview>
        <ScreenChrome label="Panel organizacji klienta" />
        <Image
          alt="Panel Kwotum z przeglądem leadów i aktywnych procesów organizacji klienta"
          className={styles.dashboardImage}
          height={650}
          priority
          sizes="(max-width: 640px) 1px, 760px"
          src="/images/product/dashboard-kwotum-v1.webp"
          width={1184}
        />
      </div>
      <div className={styles.mobileFrame}>
        <span aria-hidden="true" className={styles.mobileCamera} />
        <Image
          alt="Mobilna lista leadów w organizacji klienta"
          className={styles.mobileImage}
          height={600}
          priority
          sizes="(max-width: 640px) calc(100vw - 32px), 220px"
          src="/images/product/dashboard-kwotum-mobile-v1.webp"
          width={390}
        />
      </div>
      <figcaption>
        <span>Konfiguracja agencji</span>
        <span>Panel organizacji klienta</span>
        <span>Dane demonstracyjne</span>
      </figcaption>
    </figure>
  );
}

function SectionHeading({
  description,
  eyebrow,
  id,
  title,
}: {
  description: string;
  eyebrow: string;
  id: string;
  title: React.ReactNode;
}) {
  return (
    <header className={styles.sectionHeading}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 className="wy-marketing-heading-2" id={id}>
        {title}
      </h2>
      <p className="wy-marketing-lead">{description}</p>
    </header>
  );
}

function ProductScreen({
  alt,
  dark = false,
  desktopHeight,
  desktopSrc,
  desktopWidth,
  label,
  mobileHeight,
  mobileSrc,
}: {
  alt: string;
  dark?: boolean;
  desktopHeight: number;
  desktopSrc: string;
  desktopWidth: number;
  label: string;
  mobileHeight: number;
  mobileSrc: string;
}) {
  return (
    <figure className={`${styles.productScreen} ${dark ? styles.productScreenDark : ""}`}>
      <div className={styles.screenWindow}>
        <ScreenChrome label={label} />
        <Image
          alt={alt}
          className={styles.desktopScreenImage}
          height={desktopHeight}
          loading="eager"
          sizes="(max-width: 760px) 1px, 760px"
          src={desktopSrc}
          width={desktopWidth}
        />
        <Image
          alt={alt}
          className={styles.mobileScreenImage}
          height={mobileHeight}
          loading="eager"
          sizes="(max-width: 760px) calc(100vw - 48px), 1px"
          src={mobileSrc}
          width={390}
        />
      </div>
      <figcaption>Dane demonstracyjne</figcaption>
    </figure>
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

function PermissionCell({ allowed, role }: Readonly<{ allowed: boolean; role: string }>) {
  return (
    <td data-permission={allowed ? "allowed" : "denied"} data-role={role}>
      <span className={allowed ? styles.permissionAllowed : styles.permissionDenied}>
        <span aria-hidden="true">{allowed ? "✓" : "—"}</span>
        <span className="wy-sr-only">{allowed ? "Dozwolone" : "Brak uprawnienia"}</span>
      </span>
    </td>
  );
}

function AgencyFinalCta() {
  return (
    <section aria-labelledby="agency-final-title" className={styles.finalCta} id="agency-final-cta">
      <div className={styles.finalPanel}>
        <div className={styles.finalBrand}>
          <Image alt="" aria-hidden="true" height={30} src="/kwotum-logo-v3.png" width={30} />
          <strong>kwotum</strong>
        </div>
        <div className={styles.finalCopy}>
          <p className={styles.eyebrow}>Następny krok</p>
          <h2 className="wy-marketing-heading-2" id="agency-final-title">
            Wdrażaj proces. <span>Nie przejmuj danych klienta.</span>
          </h2>
          <p className="wy-marketing-lead">
            Zobacz pięć realnych kontekstów branżowych i wybierz właściwy punkt startowy do
            wspólnego warsztatu z firmą.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/branze">
              Zobacz zastosowania
            </Link>
            <Link className={styles.secondaryAction} href="/logowanie" prefetch={false}>
              Przejdź do panelu
            </Link>
          </div>
        </div>

        <dl aria-label="Podział odpowiedzialności" className={styles.finalResponsibilities}>
          {responsibilities.map(([term, description]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
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
