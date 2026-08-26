import Image from "next/image";
import Link from "next/link";

import styles from "./home-redesign.module.css";

type HeroSignalIcon = "budget" | "files" | "location" | "next" | "scope" | "term";

const heroCapabilities = [
  "Firmy usługowe",
  "Agencje",
  "WordPress",
  "E-mail",
  "Webhook",
  "Hosted link",
] as const;

const heroFacts = [
  ["scope", "Szybka konfiguracja"],
  ["next", "Bez integracji IT"],
  ["files", "Dla firm usługowych"],
] as const satisfies ReadonlyArray<readonly [HeroSignalIcon, string]>;

type ProcessStepIcon = "form" | "qualify" | "ready";
type KeyInformationIcon = "budget" | "files" | "score" | "term";
type LeadFactIcon = "area" | "budget" | "location" | "source" | "term";
type IntegrationIcon = "email" | "hosted" | "webhook" | "wordpress";
type PricingIcon = "growth" | "pilot";
type PricingAssuranceIcon = "decision" | "scope" | "valuation";
type FaqIcon = "customize" | "files" | "integration" | "launch" | "score";
type SupportIcon = "guide" | "product" | "wordpress";

const processSteps = [
  {
    description:
      "Klient odpowiada na kilka prostych pytań w krótkim formularzu. Prowadzimy krok po kroku, aby niczego nie pominąć.",
    icon: "form",
    title: "Zbieramy komplet informacji",
  },
  {
    description:
      "Analizujemy odpowiedzi, oceniamy potencjał, sprawdzamy kompletność i porządkujemy leady według priorytetu.",
    icon: "qualify",
    title: "Kwalifikujemy i porządkujemy",
  },
  {
    description:
      "Przekazujemy komplet: budżet, termin, lokalizację, pliki i sugerowany kolejny krok, abyś mógł działać od razu.",
    icon: "ready",
    title: "Dostarczamy gotowy lead",
  },
] as const satisfies ReadonlyArray<{
  description: string;
  icon: ProcessStepIcon;
  title: string;
}>;

const faqItems = [
  {
    answer:
      "Pilotaż zaczyna się od warsztatu jednego procesu. Termin zależy od zakresu, treści i sposobu osadzenia, dlatego nie deklarujemy stałego SLA.",
    icon: "launch",
    question: "Jak szybko mogę uruchomić Kwotum?",
  },
  {
    answer:
      "Nie. Możesz zacząć od hosted linku lub osadzenia. E-mail, webhook i WordPress dobierasz do swojego procesu.",
    icon: "integration",
    question: "Czy muszę integrować Kwotum z innymi systemami?",
  },
  {
    answer:
      "Tak. Owner lub Admin dostosowuje pytania, warunki, wynik i treści przed publikacją procesu.",
    icon: "customize",
    question: "Czy mogę dostosować formularz do mojej usługi?",
  },
  {
    answer:
      "Serwer oblicza deterministyczny score z odpowiedzi i zapisanych reguł. Wynik jest orientacyjny i ma wyjaśnialne powody.",
    icon: "score",
    question: "Skąd bierze się wynik kwalifikacji?",
  },
  {
    answer:
      "Tak. Proces może zbierać zdjęcia i pliki PDF zgodnie z limitami oraz walidacją rodzaju, rozmiaru i zawartości pliku.",
    icon: "files",
    question: "Czy mogę zbierać pliki i zdjęcia?",
  },
] as const satisfies ReadonlyArray<{
  answer: string;
  icon: FaqIcon;
  question: string;
}>;

const finalCtaReasons = [
  ["Dopasowanie do reguł", "Sprawdzane"],
  ["Kompletność odpowiedzi", "Sprawdzane"],
  ["Dane kontaktowe i zgoda", "Sprawdzane"],
  ["Następny krok", "Wyjaśniany"],
] as const;

const finalCtaFacts = [
  "Jeden proces na start",
  "Wycena indywidualna",
  "Decyzja po pilotażu",
] as const;

export function HomeRedesign() {
  return (
    <div className={`${styles.root} wy-marketing-v7-theme`} id="lorum-home">
      <section className={styles.hero} data-home-section="hero">
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow} data-intro="up" data-reveal-delay="1">
              Platforma kwalifikacji leadów
            </p>
            <h1 className="wy-marketing-heading-1" data-intro="up" data-reveal-delay="2">
              <strong>Kwalifikuj zapytania</strong>
              <span>zanim zadzwonisz</span>
              <span>do klienta</span>
            </h1>
            <p
              className={`${styles.heroDescription} wy-marketing-lead`}
              data-intro="up"
              data-reveal-delay="3"
            >
              Zamieniamy niekompletne zapytania w gotowe do działania leady z budżetem, terminem,
              lokalizacją, plikami i zalecanym kolejnym krokiem.
            </p>
            <div className={styles.heroActions} data-intro="up" data-reveal-delay="4">
              <Link className={styles.primaryAction} href="#przykladowy-lead">
                Zobacz demo
              </Link>
              <Link className={styles.secondaryAction} href="#jak-dziala">
                <span aria-hidden="true" className={styles.playIcon}>
                  ▶
                </span>
                Zobacz jak to działa
              </Link>
            </div>
            <ul className={styles.heroFacts} data-intro="up" data-reveal-delay="5">
              {heroFacts.map(([icon, label]) => (
                <li key={label}>
                  <span>
                    <HeroSignalGlyph kind={icon} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <HeroProductRender />
        </div>

        <div className={styles.heroSignalRail}>
          <p>Działa w Twoim procesie</p>
          <ul aria-label="Najczęstsze zastosowania i kanały Kwotum">
            {heroCapabilities.map((capability) => (
              <li key={capability}>
                <span aria-hidden="true" />
                {capability}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="flow-story-title"
        className={styles.flowSection}
        data-home-section="guided-flow"
        id="jak-dziala"
      >
        <div className={styles.processSectionInner}>
          <header className={styles.processHeading}>
            <p className={styles.eyebrow}>Proste i skuteczne</p>
            <h2 className="wy-marketing-heading-2" data-reveal="up" id="flow-story-title">
              <strong>Od niepełnego zapytania</strong>
              <span>do gotowego leada</span>
            </h2>
          </header>

          <ol
            aria-label="Przebieg od krótkiego zapytania do kompletnego leada"
            className={styles.processCards}
            data-home-proof="flow-storyboard"
          >
            {processSteps.map((step, index) => (
              <li key={step.title}>
                <article className={styles.processCard}>
                  <span className={styles.processNumber}>{index + 1}</span>
                  <span className={styles.processIcon}>
                    <ProcessStepGlyph kind={step.icon} />
                  </span>
                  <h3 className="wy-marketing-heading-3">{step.title}</h3>
                  <p className="wy-marketing-body">{step.description}</p>
                </article>
                {index < processSteps.length - 1 ? (
                  <span aria-hidden="true" className={styles.processConnector}>
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="key-information-title"
        className={`${styles.demoSection} ${styles.keyInformationSection}`}
        data-home-section="client-demo"
        id="kluczowe-informacje"
      >
        <div className={styles.keyInformationInner}>
          <header className={styles.keyInformationHeading}>
            <p className={styles.eyebrow}>Wszystko pod kontrolą</p>
            <h2 className="wy-marketing-heading-2" id="key-information-title">
              <strong>Wszystkie kluczowe informacje</strong>
              <span>w jednym miejscu</span>
            </h2>
            <p className="wy-marketing-lead">
              Masz pełen wgląd w budżet, termin, dokumenty i wynik kwalifikacji.
              <span>Szybciej podejmujesz decyzje i sprawniej działasz.</span>
            </p>
          </header>

          <div
            aria-label="Dane demonstracyjne: cztery kluczowe grupy informacji o leadzie"
            className={styles.keyInformationCards}
            data-home-proof="key-information"
          >
            <article className={styles.keyInformationCard}>
              <span className={styles.keyInformationIcon}>
                <KeyInformationGlyph kind="budget" />
              </span>
              <h3 className="wy-marketing-heading-3">Budżet</h3>
              <p className={styles.keyInformationValue}>20 000 – 40 000 zł</p>
            </article>

            <article className={styles.keyInformationCard}>
              <span className={styles.keyInformationIcon}>
                <KeyInformationGlyph kind="term" />
              </span>
              <h3 className="wy-marketing-heading-3">Termin realizacji</h3>
              <p className={styles.keyInformationValue}>Czerwiec 2024</p>
            </article>

            <article className={`${styles.keyInformationCard} ${styles.keyInformationFiles}`}>
              <span className={styles.keyInformationIcon}>
                <KeyInformationGlyph kind="files" />
              </span>
              <h3 className="wy-marketing-heading-3">Pliki i zdjęcia</h3>
              <div aria-hidden="true" className={styles.keyInformationThumbnails}>
                <span className={styles.planThumbnail} />
                <span className={styles.photoThumbnail}>
                  <Image
                    alt=""
                    fill
                    sizes="76px"
                    src="/images/redesign/hero-kitchen-diptych-v1.webp"
                  />
                </span>
                <span className={`${styles.photoThumbnail} ${styles.outdoorThumbnail}`}>
                  <Image
                    alt=""
                    fill
                    loading="eager"
                    sizes="76px"
                    src="/images/redesign/industry-template-sprite-v1.webp"
                  />
                </span>
                <span className={styles.moreThumbnail}>+3</span>
              </div>
            </article>

            <article className={`${styles.keyInformationCard} ${styles.keyInformationScore}`}>
              <span className={styles.keyInformationIcon}>
                <KeyInformationGlyph kind="score" />
              </span>
              <h3 className="wy-marketing-heading-3">Wynik kwalifikacji</h3>
              <div
                aria-label="Przykładowy wynik kwalifikacji: 87 na 100"
                className={styles.keyScore}
              >
                87
              </div>
              <p className={styles.keyInformationValue}>Wysoki potencjał</p>
            </article>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="decision-title"
        className={styles.decisionSection}
        data-home-section="decision-document"
        id="przykladowy-lead"
      >
        <div className={styles.leadExampleInner}>
          <header className={styles.leadExampleHeading}>
            <p className={styles.eyebrow}>Przykładowy lead</p>
            <h2 className="wy-marketing-heading-2" id="decision-title">
              Kuchnia na wymiar – Kraków
            </h2>
          </header>
          <DecisionDocument />
        </div>
      </section>

      <section
        aria-labelledby="integrations-title"
        className={`${styles.deploymentSection} ${styles.integrationSection}`}
        data-home-section="industry-and-publishing"
        id="integracje"
      >
        <div className={styles.integrationInner}>
          <header className={styles.integrationHeading}>
            <p className={styles.eyebrow}>Integracje i automatyzacje</p>
            <h2 className="wy-marketing-heading-2" id="integrations-title">
              Kwotum działa z Twoim obecnym procesem
            </h2>
            <p className="wy-marketing-lead">
              Przesyłaj leady tam, gdzie ich potrzebujesz. Bez skomplikowanej konfiguracji
              <span>i bez przebudowy Twojej strony.</span>
            </p>
          </header>

          <div
            aria-label="Kanały publikacji i przekazywania uporządkowanego leada"
            className={styles.integrationStage}
            data-home-proof="integration-system"
          >
            <IntegrationChannel
              description="Otrzymuj uporządkowane leady bezpośrednio na skrzynkę osoby lub zespołu."
              icon="email"
              placement="email"
              title="E-mail"
            />
            <IntegrationChannel
              description="Przekazuj dane leada do własnego systemu po skonfigurowaniu endpointu."
              icon="webhook"
              placement="webhook"
              title="Webhook"
            />

            <article className={styles.integrationLeadCard}>
              <header>
                <Image
                  alt=""
                  aria-hidden="true"
                  className={styles.integrationBrandMark}
                  height={24}
                  src="/kwotum-logo-v3.png"
                  width={24}
                />
                <strong>Kwotum</strong>
              </header>
              <div>
                <span className={styles.integrationLeadBadge}>Nowy lead</span>
                <h3>Kuchnia na wymiar – Kraków</h3>
                <dl>
                  <div>
                    <dt>Kanał</dt>
                    <dd>Formularz WWW</dd>
                  </div>
                  <div>
                    <dt>Budżet</dt>
                    <dd>20 000 – 40 000 zł</dd>
                  </div>
                  <div>
                    <dt>Termin</dt>
                    <dd>Czerwiec 2024</dd>
                  </div>
                  <div>
                    <dt>Lokalizacja</dt>
                    <dd>Kraków</dd>
                  </div>
                </dl>
                <p className={styles.integrationLeadStatus}>
                  <span aria-hidden="true">✓</span>
                  Lead zapisany i uporządkowany
                </p>
              </div>
            </article>

            <IntegrationChannel
              description="Osadź proces na istniejącej stronie przez wtyczkę i zachowaj obecny serwis."
              icon="wordpress"
              placement="wordpress"
              title="WordPress"
            />
            <IntegrationChannel
              description="Udostępniaj opublikowany proces pod bezpośrednim adresem bez dodatkowego wdrożenia."
              icon="hosted"
              placement="hosted"
              title="Hosted link"
            />

            <span
              aria-hidden="true"
              className={`${styles.integrationConnector} ${styles.connectorEmail}`}
            />
            <span
              aria-hidden="true"
              className={`${styles.integrationConnector} ${styles.connectorWebhook}`}
            />
            <span
              aria-hidden="true"
              className={`${styles.integrationConnector} ${styles.connectorWordpress}`}
            />
            <span
              aria-hidden="true"
              className={`${styles.integrationConnector} ${styles.connectorHosted}`}
            />
          </div>

          <ul aria-label="Najważniejsze właściwości połączeń" className={styles.integrationRail}>
            <li>
              <span aria-hidden="true">✓</span>
              <p>
                <strong>Gotowe kanały</strong>
                <small>E-mail, webhook, WordPress i hosted link.</small>
              </p>
            </li>
            <li>
              <span aria-hidden="true">✓</span>
              <p>
                <strong>Bez przebudowy strony</strong>
                <small>Wybierasz sposób publikacji właściwy dla procesu.</small>
              </p>
            </li>
            <li>
              <span aria-hidden="true">✓</span>
              <p>
                <strong>Kontrola dostępu</strong>
                <small>Dane organizacji są sprawdzane po stronie serwera.</small>
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="pricing-title"
        className={`${styles.pilotSection} ${styles.pricingSection}`}
        data-home-section="pilot"
        id="pilotaz"
      >
        <div className={styles.pricingInner}>
          <header className={styles.pricingHeading}>
            <p className={styles.eyebrow}>Przejrzyste zasady</p>
            <h2 className="wy-marketing-heading-2" id="pricing-title">
              Prosty start, który rośnie razem z Tobą
            </h2>
            <p className="wy-marketing-lead">
              Zaczynasz od jednego procesu i wspólnie ustalamy zakres.
              <span>Bez niezatwierdzonych cen, limitów i długoterminowych zobowiązań.</span>
            </p>
          </header>

          <div
            aria-label="Dwa etapy rozpoczęcia współpracy z Kwotum"
            className={styles.pricingCards}
            data-home-proof="pricing-system"
          >
            <PricingCard
              action="Sprawdź zakres pilotażu"
              description="Wspólnie uruchamiamy jeden rzeczywisty typ zapytania i sprawdzamy jakość otrzymanych briefów."
              features={[
                "Warsztat jednego procesu",
                "Konfiguracja pytań i wyniku",
                "Osadzenie lub hosted link",
                "Wspólna weryfikacja jakości leadów",
                "Zakres ustalany indywidualnie",
              ]}
              icon="pilot"
              title="Pilotaż"
              value="Wycena indywidualna"
            />

            <PricingCard
              action="Zobacz model współpracy"
              badge="Po pilotażu"
              description="Po wynikach pilotażu wspólnie decydujemy, czy i w jakim zakresie rozwijać rozwiązanie."
              featured
              features={[
                "Decyzja na podstawie pilotażu",
                "Kolejne procesy według potrzeb",
                "Dalsze dopasowanie logiki",
                "WordPress, e-mail lub webhook",
                "Wsparcie i optymalizacja",
                "Model self-service jeszcze nieustalony",
              ]}
              icon="growth"
              title="Dalszy rozwój"
              value="Zakres po weryfikacji"
            />
          </div>

          <ul aria-label="Warunki rozpoczęcia współpracy" className={styles.pricingAssurances}>
            <PricingAssurance icon="scope" label="Jeden proces na start" />
            <PricingAssurance icon="valuation" label="Wycena indywidualna" />
            <PricingAssurance icon="decision" label="Decyzja po pilotażu" />
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="faq-title"
        className={styles.faqSection}
        data-home-section="faq"
        id="faq"
      >
        <div className={styles.faqInner} data-home-proof="faq-system">
          <div className={styles.faqMain}>
            <header className={styles.faqHeading}>
              <p className={styles.eyebrow}>FAQ</p>
              <h2 className="wy-marketing-heading-2" id="faq-title">
                Najczęściej zadawane pytania
              </h2>
              <p className="wy-marketing-lead">
                Masz pytanie? Sprawdź odpowiedzi na najczęstsze pytania albo poznaj istniejące
                materiały produktu.
              </p>
            </header>

            <div className={styles.faqAccordion}>
              {faqItems.map((item) => (
                <details className={styles.faqItem} key={item.question}>
                  <summary>
                    <span className={styles.faqItemIcon}>
                      <FaqGlyph kind={item.icon} />
                    </span>
                    <span>{item.question}</span>
                    <span aria-hidden="true" className={styles.faqToggle} />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <aside aria-labelledby="faq-support-title" className={styles.faqSupport}>
            <span aria-hidden="true" className={styles.faqSupportIcon}>
              <SupportHeadsetGlyph />
            </span>
            <h3 className="wy-marketing-heading-3" id="faq-support-title">
              Potrzebujesz pomocy?
            </h3>
            <p className={`${styles.faqSupportIntro} wy-marketing-body`}>
              Skorzystaj z istniejących materiałów produktu i wybierz kolejny krok odpowiedni dla
              Twojego procesu.
            </p>

            <nav aria-label="Materiały pomocy Kwotum" className={styles.faqSupportLinks}>
              <SupportLink
                description="Proces od pytań do leada"
                href="/jak-dziala"
                icon="guide"
                label="Jak działa Kwotum"
              />
              <SupportLink
                description="Funkcje i zasady wyniku"
                href="/produkt"
                icon="product"
                label="Poznaj produkt"
              />
              <SupportLink
                description="Osadzenie, shortcode i popup"
                href="/wordpress"
                icon="wordpress"
                label="WordPress i instalacja"
              />
            </nav>

            <div aria-label="Zweryfikowane zasady produktu" className={styles.faqSupportFacts}>
              <div>
                <strong>RLS</strong>
                <b>Separacja organizacji</b>
                <span>kontrola dostępu</span>
              </div>
              <div>
                <strong>MVP</strong>
                <b>Zweryfikowany zakres</b>
                <span>bez atrap funkcji</span>
              </div>
            </div>

            <Link className={styles.faqSupportAction} href="/cennik">
              Zobacz zakres pilotażu
            </Link>
          </aside>
        </div>
      </section>

      <section
        aria-labelledby="final-cta-title"
        className={styles.finalCtaSection}
        data-home-section="final-cta"
        id="zacznij"
      >
        <div className={styles.finalCtaPanel} data-home-proof="final-cta-system">
          <div aria-label="Kwotum" className={styles.finalCtaBrand}>
            <Image alt="" aria-hidden="true" height={32} src="/kwotum-logo-v3.png" width={32} />
            <strong>kwotum</strong>
          </div>

          <div className={styles.finalCtaCopy}>
            <p className={styles.eyebrow}>Uporządkowany proces, lepszy brief</p>
            <h2 className="wy-marketing-heading-2" id="final-cta-title">
              Gotowy, aby kwalifikować leady jak najlepiej?
            </h2>
            <p className="wy-marketing-lead">
              Zobacz działający proces na przykładowym leadzie i sprawdź, jak Kwotum porządkuje
              budżet, termin, lokalizację, pliki i kolejny krok.
            </p>
            <div className={styles.finalCtaActions}>
              <Link href="#przykladowy-lead">Zobacz demo</Link>
              <Link href="/produkt">
                <span aria-hidden="true" className={styles.finalCtaPlay}>
                  ▶
                </span>
                Poznaj produkt
              </Link>
            </div>
          </div>

          <div aria-label="Zweryfikowany zakres i przykładowy wynik" className={styles.finalProof}>
            <FinalSnapshotCard
              detail="w przykładowym briefie"
              label="Kluczowe dane leada"
              signalCount={5}
              suffix="grup"
              value="5"
            />
            <FinalSnapshotCard
              detail="w aktualnym zakresie"
              label="Kanały przekazania"
              signalCount={4}
              suffix="kanały"
              value="4"
            />

            <article className={styles.finalScoreCard}>
              <h3 className="wy-marketing-heading-3">Co wyjaśnia wynik kwalifikacji</h3>
              <div className={styles.finalScoreBody}>
                <ul>
                  {finalCtaReasons.map(([label, state]) => (
                    <li key={label}>
                      <span aria-hidden="true" className={styles.finalReasonIcon}>
                        ✓
                      </span>
                      <strong>{label}</strong>
                      <small>{state}</small>
                    </li>
                  ))}
                </ul>
                <div className={styles.finalScoreResult}>
                  <strong aria-label="Przykładowy wynik: 87 na 100">
                    <span>87</span>
                  </strong>
                  <span>Przykładowy wynik kwalifikacji</span>
                </div>
              </div>
            </article>
          </div>

          <ul aria-label="Warunki programu pilotażowego" className={styles.finalCtaFacts}>
            {finalCtaFacts.map((fact) => (
              <li key={fact}>
                <span aria-hidden="true">✓</span>
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function FinalSnapshotCard({
  detail,
  label,
  signalCount,
  suffix,
  value,
}: {
  detail: string;
  label: string;
  signalCount: number;
  suffix: string;
  value: string;
}) {
  return (
    <article className={styles.finalSnapshotCard}>
      <h3 className="wy-marketing-heading-3">{label}</h3>
      <p>
        <strong>{value}</strong>
        <span>{suffix}</span>
      </p>
      <div aria-hidden="true" className={styles.finalSignalLine}>
        {Array.from({ length: signalCount }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <small>{detail}</small>
    </article>
  );
}

function SupportLink({
  description,
  href,
  icon,
  label,
}: {
  description: string;
  href: string;
  icon: SupportIcon;
  label: string;
}) {
  return (
    <Link href={href}>
      <span aria-hidden="true" className={styles.faqSupportLinkIcon}>
        <SupportGlyph kind={icon} />
      </span>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <span aria-hidden="true" className={styles.faqSupportArrow}>
        ›
      </span>
    </Link>
  );
}

function SupportHeadsetGlyph() {
  return (
    <svg fill="none" viewBox="0 0 48 48">
      <path d="M10 27v-5a14 14 0 0 1 28 0v5" />
      <rect height="12" rx="3" width="7" x="8" y="24" />
      <rect height="12" rx="3" width="7" x="33" y="24" />
      <path d="M36.5 36v1.5A4.5 4.5 0 0 1 32 42h-5" />
    </svg>
  );
}

function SupportGlyph({ kind }: { kind: SupportIcon }) {
  if (kind === "guide") {
    return (
      <svg fill="none" viewBox="0 0 32 32">
        <path d="M6 7.5h8a4 4 0 0 1 4 4v14H10a4 4 0 0 0-4 4z" />
        <path d="M26 7.5h-8a4 4 0 0 0-4 4v14h8a4 4 0 0 1 4 4z" />
      </svg>
    );
  }

  if (kind === "product") {
    return (
      <svg fill="none" viewBox="0 0 32 32">
        <rect height="21" rx="3" width="21" x="5.5" y="5.5" />
        <path d="M10 12h12M10 16h8M10 20h5" />
      </svg>
    );
  }

  return (
    <svg fill="none" viewBox="0 0 32 32">
      <path d="M16 4.5 27 9v7.5c0 6-4.5 9.5-11 11-6.5-1.5-11-5-11-11V9z" />
      <path d="M11 11.5h10v9H11zM14 11.5v9" />
    </svg>
  );
}

function FaqGlyph({ kind }: { kind: FaqIcon }) {
  if (kind === "launch") {
    return (
      <svg fill="none" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="13" />
        <path d="M20 12v8l5 3M10 20H6M34 20h-4" />
      </svg>
    );
  }

  if (kind === "integration") {
    return (
      <svg fill="none" viewBox="0 0 40 40">
        <path d="M15 8v7h-3a4 4 0 0 0-4 4v3h7v9h10v-9h7v-3a4 4 0 0 0-4-4h-3V8h-3a4 4 0 0 0-4 4 4 4 0 0 0-4-4z" />
      </svg>
    );
  }

  if (kind === "customize") {
    return (
      <svg fill="none" viewBox="0 0 40 40">
        <path d="M10 7h16l4 4v11M26 7v5h5M10 7v26h13" />
        <path d="m22 29 8-8 4 4-8 8-5 1z" />
      </svg>
    );
  }

  if (kind === "score") {
    return (
      <svg fill="none" viewBox="0 0 40 40">
        <path d="M8 31V21h6v10M17 31V13h6v18M26 31V7h6v24" />
      </svg>
    );
  }

  return (
    <svg fill="none" viewBox="0 0 40 40">
      <path d="m14 22 8-8a5 5 0 1 1 7 7L17 33a8 8 0 0 1-11-11L19 9" />
      <path d="m11 25 12-12" />
    </svg>
  );
}

function IntegrationChannel({
  description,
  icon,
  placement,
  title,
}: {
  description: string;
  icon: IntegrationIcon;
  placement: "email" | "hosted" | "webhook" | "wordpress";
  title: string;
}) {
  return (
    <article className={`${styles.integrationChannel} ${styles[`integration${placement}`]}`}>
      <span className={`${styles.integrationChannelIcon} ${styles[`integrationIcon${icon}`]}`}>
        <IntegrationGlyph kind={icon} />
      </span>
      <div>
        <h3 className="wy-marketing-heading-3">{title}</h3>
        <p className="wy-marketing-body">{description}</p>
      </div>
    </article>
  );
}

function IntegrationGlyph({ kind }: { kind: IntegrationIcon }) {
  if (kind === "email") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 48 48">
        <rect height="27" rx="3" width="35" x="6.5" y="10.5" />
        <path d="m8 13 16 13 16-13" />
      </svg>
    );
  }

  if (kind === "webhook") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 48 48">
        <circle cx="24" cy="9" r="4" />
        <circle cx="10" cy="34" r="4" />
        <circle cx="38" cy="34" r="4" />
        <path d="M21 12 12 30M27 12l9 18M14 34h20" />
      </svg>
    );
  }

  if (kind === "wordpress") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="18" />
        <path d="m13 16 8 22m14-22-8 22M10 16h26M16 12c3 7 6 15 8 23 2-8 5-16 8-23" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 48 48">
      <path d="M20 28a8 8 0 0 0 11 0l5-5a8 8 0 0 0-11-11l-3 3" />
      <path d="M28 20a8 8 0 0 0-11 0l-5 5a8 8 0 0 0 11 11l3-3" />
    </svg>
  );
}

function PricingCard({
  action,
  badge,
  description,
  featured = false,
  features,
  icon,
  title,
  value,
}: {
  action: string;
  badge?: string;
  description: string;
  featured?: boolean;
  features: readonly string[];
  icon: PricingIcon;
  title: string;
  value: string;
}) {
  return (
    <article className={`${styles.pricingCard} ${featured ? styles.pricingCardFeatured : ""}`}>
      <header>
        <span className={styles.pricingCardIcon}>
          <PricingGlyph kind={icon} />
        </span>
        <div>
          <h3 className="wy-marketing-heading-3">{title}</h3>
          <strong>{value}</strong>
        </div>
        {badge ? <span className={styles.pricingBadge}>{badge}</span> : null}
      </header>
      <p className="wy-sr-only">{description}</p>
      <ul>
        {features.map((feature) => (
          <li key={feature}>
            <span aria-hidden="true">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link href="/cennik">{action}</Link>
    </article>
  );
}

function PricingAssurance({ icon, label }: { icon: PricingAssuranceIcon; label: string }) {
  return (
    <li>
      <PricingAssuranceGlyph kind={icon} />
      {label}
    </li>
  );
}

function PricingGlyph({ kind }: { kind: PricingIcon }) {
  if (kind === "pilot") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 48 48">
        <circle cx="20" cy="17" r="6" />
        <path d="M8 38v-3a10 10 0 0 1 20 0v3M30 15a5 5 0 1 1 0 10M32 29a9 9 0 0 1 8 9" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 48 48">
      <path d="m9 34 11-12 7 7 12-14" />
      <path d="M29 15h10v10" />
    </svg>
  );
}

function PricingAssuranceGlyph({ kind }: { kind: PricingAssuranceIcon }) {
  if (kind === "scope") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 32 32">
        <rect height="23" rx="2" width="23" x="4.5" y="6" />
        <path d="M4.5 12h23M10 3v6M22 3v6" />
      </svg>
    );
  }

  if (kind === "valuation") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 32 32">
        <rect height="20" rx="3" width="25" x="3.5" y="6" />
        <path d="M4 12h24M9 20h7" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 32 32">
      <path d="M16 3 27 7v8c0 7-4.5 11.5-11 14-6.5-2.5-11-7-11-14V7Z" />
      <path d="m11 16 3 3 7-8" />
    </svg>
  );
}

function HeroProductRender() {
  return (
    <figure
      aria-label="Demonstracyjny formularz kwalifikacyjny i uporządkowany lead w Kwotum"
      className={styles.productScene}
      data-home-proof="rendered-product-scene"
      data-intro="right"
      data-reveal-delay="3"
    >
      <figcaption className="wy-sr-only">
        Po lewej klient wskazuje orientacyjny budżet. Po prawej firma otrzymuje demonstracyjny
        rekord projektu z wynikiem kwalifikacji, budżetem, terminem, lokalizacją i kolejnym krokiem.
      </figcaption>
      <div aria-hidden="true" className={styles.productDashboard}>
        <header className={styles.dashboardTopbar}>
          <span className={styles.dashboardBrand}>
            <Image alt="" aria-hidden="true" height={15} src="/kwotum-logo-v3.png" width={15} />
            Kwotum
          </span>
          <span className={styles.dashboardAccount}>
            <i>⌁</i>
            <b>MK</b>
          </span>
        </header>
        <div className={styles.dashboardLayout}>
          <aside className={styles.dashboardRail}>
            <span className={styles.railActive}>▦</span>
            <span>◫</span>
            <span>♙</span>
            <span>⌁</span>
          </aside>
          <div className={styles.dashboardMain}>
            <div className={styles.dashboardLeadHead}>
              <div>
                <small>Lead</small>
                <h2>Kuchnia na wymiar – Nowak</h2>
                <p>Lead demonstracyjny · 24 maja 2024</p>
              </div>
              <div className={styles.leadScore}>
                <strong>87</strong>
                <span>
                  Wynik
                  <br />
                  kwalifikacji
                </span>
              </div>
            </div>
            <nav className={styles.dashboardTabs}>
              <strong>Podsumowanie</strong>
              <span>Odpowiedzi</span>
              <span>Pliki i zdjęcia</span>
              <span>Aktywność</span>
              <span>Notatki</span>
            </nav>
            <div className={styles.dashboardContent}>
              <div className={styles.leadSummary}>
                <dl className={styles.leadStats}>
                  <div>
                    <dt>
                      ▣ <span>Budżet</span>
                    </dt>
                    <dd>30 000 – 60 000 zł</dd>
                  </div>
                  <div>
                    <dt>
                      □ <span>Pliki i zdjęcia</span>
                    </dt>
                    <dd>3 załączniki</dd>
                  </div>
                  <div>
                    <dt>
                      ▣ <span>Termin realizacji</span>
                    </dt>
                    <dd>Czerwiec 2024</dd>
                  </div>
                  <div>
                    <dt>
                      ♙ <span>Powierzchnia</span>
                    </dt>
                    <dd>12 m²</dd>
                  </div>
                  <div>
                    <dt>
                      ⌖ <span>Lokalizacja</span>
                    </dt>
                    <dd>Kraków</dd>
                  </div>
                  <div>
                    <dt>
                      ✿ <span>Liczba pomieszczeń</span>
                    </dt>
                    <dd>1</dd>
                  </div>
                </dl>
                <div className={styles.nextStepCard}>
                  <span className={styles.nextStepIcon}>□</span>
                  <p>
                    <small>Zalecany kolejny krok</small>
                    <strong>Skontaktuj się z leadem</strong>
                    <span>Budżet, termin i zakres są gotowe do rozmowy.</span>
                  </p>
                  <b>Otwórz lead</b>
                </div>
              </div>
              <aside className={styles.contactCard}>
                <strong>Dane kontaktowe</strong>
                <dl>
                  <div>
                    <dt>Imię i nazwisko</dt>
                    <dd>Jan Nowak</dd>
                  </div>
                  <div>
                    <dt>Telefon</dt>
                    <dd>+48 600 000 000</dd>
                  </div>
                  <div>
                    <dt>E-mail</dt>
                    <dd>demo@kwotum.pl</dd>
                  </div>
                  <div>
                    <dt>Źródło zapytania</dt>
                    <dd>Formularz WWW</dd>
                  </div>
                  <div>
                    <dt>ID zapytania</dt>
                    <dd>#DEMO-4521</dd>
                  </div>
                </dl>
              </aside>
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className={styles.processPhone}>
        <header>
          <span>‹</span>
          <Image alt="" height={22} src="/kwotum-logo-v3.png" width={22} />
        </header>
        <div className={styles.phoneProgress}>
          <small>Krok 2 z 6</small>
          <span>
            <i />
          </span>
        </div>
        <h3>
          Jaki jest orientacyjny
          <br />
          budżet projektu?
        </h3>
        <p>Dzięki temu lepiej dopasujemy rozwiązanie do Twoich potrzeb.</p>
        <ul>
          {[
            "Do 10 000 zł",
            "10 000 – 30 000 zł",
            "30 000 – 60 000 zł",
            "60 000 – 100 000 zł",
            "Powyżej 100 000 zł",
            "Nie wiem",
          ].map((option, index) => (
            <li className={index === 2 ? styles.phoneOptionActive : ""} key={option}>
              <span />
              {option}
            </li>
          ))}
        </ul>
        <footer>
          <span>Wstecz</span>
          <strong>Dalej</strong>
        </footer>
      </div>
    </figure>
  );
}

function HeroSignalGlyph({ kind }: { kind: HeroSignalIcon }) {
  if (kind === "scope") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M7 3.75h7l3 3v13.5H7z" />
        <path d="M14 3.75v3h3M9.5 11h5M9.5 14.5h5" />
      </svg>
    );
  }

  if (kind === "budget") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M4.5 7.25h14.25v11H4.5z" />
        <path d="M6.5 7.25V5.5h10v1.75M15.25 11h3.5v3.5h-3.5a1.75 1.75 0 0 1 0-3.5Z" />
      </svg>
    );
  }

  if (kind === "term") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M5 6.25h14v13H5zM5 9.5h14M8 4v4M16 4v4" />
        <path d="M9 13h2v2H9z" />
      </svg>
    );
  }

  if (kind === "location") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M18 10c0 4.5-6 10-6 10s-6-5.5-6-10a6 6 0 1 1 12 0Z" />
        <circle cx="12" cy="10" r="2" />
      </svg>
    );
  }

  if (kind === "files") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="m9.25 12.75 4.9-4.9a2.12 2.12 0 1 1 3 3l-6.35 6.36a3.5 3.5 0 0 1-4.95-4.95l6.36-6.36" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M5 12h13M13.5 7.5 18 12l-4.5 4.5" />
    </svg>
  );
}

function ProcessStepGlyph({ kind }: { kind: ProcessStepIcon }) {
  if (kind === "form") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 48 48">
        <path d="M12 7h21a3 3 0 0 1 3 3v25a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3Z" />
        <path d="M16 15h4m5 0h5M16 23h4m5 0h5M16 31h9" />
        <path d="m30 32 4 1.5 1.5 4L38 35l3 3-3-8Z" />
      </svg>
    );
  }

  if (kind === "qualify") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 48 48">
        <path d="M17 8h14v5h5v28H12V13h5Z" />
        <path d="M17 8v6h14V8M18 22l2 2 4-5M28 22h4M18 31l2 2 4-5M28 31h4" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 48 48">
      <circle cx="22" cy="16" r="8" />
      <path d="M8 40v-4a12 12 0 0 1 20.5-8.5" />
      <circle cx="34" cy="33" r="9" />
      <path d="m30 33 2.5 2.5L38 30" />
    </svg>
  );
}

function KeyInformationGlyph({ kind }: { kind: KeyInformationIcon }) {
  if (kind === "budget") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 48 48">
        <path d="M9 14h27a3 3 0 0 1 3 3v21H12a5 5 0 0 1-5-5V13a5 5 0 0 1 5-5h21v6" />
        <path d="M30 23h9v8h-9a4 4 0 0 1 0-8Z" />
      </svg>
    );
  }

  if (kind === "term") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 48 48">
        <path d="M8 12h32v29H8zM8 20h32M16 7v10M32 7v10" />
      </svg>
    );
  }

  if (kind === "files") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 48 48">
        <path d="M12 7h17l8 8v26H12zM29 7v8h8" />
        <circle cx="22" cy="24" r="3" />
        <path d="m16 35 7-7 5 5 3-3 6 5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 48 48">
      <path d="M24 7a17 17 0 1 0 17 17" />
      <path d="M24 7v7a10 10 0 1 1-10 10" />
      <circle cx="36" cy="12" r="3" />
    </svg>
  );
}

function DecisionDocument() {
  const leadFacts = [
    ["budget", "Budżet", "20 000 – 40 000 zł"],
    ["term", "Termin realizacji", "Czerwiec 2024"],
    ["location", "Lokalizacja", "Kraków"],
    ["area", "Metraż", "12 m²"],
    ["source", "Źródło", "Strona WWW"],
  ] as const satisfies ReadonlyArray<readonly [LeadFactIcon, string, string]>;

  return (
    <article
      aria-label="Dane demonstracyjne: kompletny lead z wynikiem i następnym krokiem"
      className={styles.decisionDocument}
      data-home-proof="decision-document"
    >
      <dl className={styles.leadFacts}>
        {leadFacts.map(([icon, label, value]) => (
          <div key={label}>
            <span aria-hidden="true" className={styles.leadFactIcon}>
              <LeadFactGlyph kind={icon} />
            </span>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div aria-label="Zdjęcia demonstracyjnego projektu" className={styles.leadGallery}>
        <div className={styles.leadGalleryMain}>
          <Image
            alt="Wizualizacja demonstracyjnej kuchni w zielonej zabudowie"
            fill
            sizes="(min-width: 1025px) 400px, 60vw"
            src="/images/redesign/lead-kitchen-main-v7.webp"
          />
        </div>
        <div className={styles.leadGallerySide}>
          <div>
            <Image
              alt=""
              fill
              sizes="(min-width: 1025px) 176px, 30vw"
              src="/images/redesign/lead-kitchen-detail-top-v7.webp"
            />
          </div>
          <div>
            <Image
              alt=""
              fill
              sizes="(min-width: 1025px) 176px, 30vw"
              src="/images/redesign/lead-kitchen-detail-bottom-v7.webp"
            />
            <span aria-hidden="true">+1</span>
          </div>
        </div>
      </div>

      <aside className={styles.leadRecommendation}>
        <div className={styles.leadResult}>
          <span aria-hidden="true" className={styles.leadResultGauge}>
            <i>✓</i>
          </span>
          <p>
            <strong>
              87<small>/100</small>
            </strong>
            <span>Wysoki potencjał</span>
          </p>
        </div>
        <div className={styles.leadNextStep}>
          <span>Zalecany kolejny krok</span>
          <strong>Umów konsultację projektową</strong>
          <p>
            Lead jest dobrze dopasowany. Skontaktuj się w ciągu 24 h, aby zwiększyć szansę na
            realizację.
          </p>
        </div>
        <div className={styles.leadRecommendationActions}>
          <Link href="/jak-dziala">Zobacz proces</Link>
          <Link href="/produkt">Zobacz zasady wyniku</Link>
        </div>
      </aside>
    </article>
  );
}

function LeadFactGlyph({ kind }: { kind: LeadFactIcon }) {
  if (kind === "budget") {
    return (
      <svg fill="none" viewBox="0 0 24 24">
        <path d="M7 5h9a2 2 0 0 1 2 2v12H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h8" />
        <path d="M14 10h5v5h-5a2.5 2.5 0 0 1 0-5Z" />
      </svg>
    );
  }

  if (kind === "term") {
    return (
      <svg fill="none" viewBox="0 0 24 24">
        <path d="M5 6h14v14H5zM5 10h14M9 3v6M15 3v6" />
      </svg>
    );
  }

  if (kind === "location") {
    return (
      <svg fill="none" viewBox="0 0 24 24">
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (kind === "area") {
    return (
      <svg fill="none" viewBox="0 0 24 24">
        <path d="M5 8V5h3M16 5h3v3M19 16v3h-3M8 19H5v-3M8 12h8M12 8v8" />
      </svg>
    );
  }

  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path d="M6 4h9l3 3v13H6zM15 4v4h4M9 12h6M9 16h4" />
    </svg>
  );
}
