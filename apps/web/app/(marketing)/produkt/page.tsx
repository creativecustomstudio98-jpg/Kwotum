import Image from "next/image";
import Link from "next/link";

import { marketingMetadata } from "../../../lib/marketing/metadata";
import styles from "./product-page.module.css";

export const metadata = marketingMetadata(
  "System kwalifikacji zapytań dla firm usługowych",
  "Poznaj Kwotum: od własnego procesu i formularza na stronie do uporządkowanego leada z budżetem, terminem, lokalizacją i materiałami.",
  "/produkt",
);

const builderFacts = [
  "Własna kolejność pytań i sekcji",
  "Warunki przejścia oraz reguły wyniku",
  "Podgląd przed publikacją zmian",
] as const;

const widgetFacts = [
  "Widżet, WordPress albo osobny link",
  "Automatycznie zapisywany postęp",
  "Jasno opisany wynik orientacyjny",
] as const;

const leadFacts = [
  "Zakres, budżet, termin i lokalizacja",
  "Odpowiedzi oraz materiały klienta",
  "Widoczne powody dopasowania",
] as const;

const journey = [
  ["01", "Budowa procesu", "#proces"],
  ["02", "Widok klienta", "#doswiadczenie-klienta"],
  ["03", "Gotowy lead", "#lead"],
  ["04", "Zakres decyzji", "#odpowiedzialnosc"],
] as const;

export default function ProductPage() {
  return (
    <div className={`${styles.page} wy-marketing-v7-theme`}>
      <section aria-labelledby="product-title" className={styles.hero} data-product-hero>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Produkt Kwotum</p>
            <h1 className="wy-marketing-heading-1" id="product-title">
              <strong>Od pierwszego pytania</strong>
              <span>do leada gotowego do rozmowy</span>
            </h1>
            <p className={`${styles.heroDescription} wy-marketing-lead`}>
              Jeden proces prowadzi klienta, porządkuje odpowiedzi i przekazuje firmie kompletny
              kontekst zapytania — bez przepisywania danych między formularzem, pocztą i arkuszem.
            </p>
            <div className={styles.actions} data-product-actions>
              <Link className={styles.primaryAction} href="/jak-dziala">
                Zobacz, jak działa
              </Link>
              <Link className={styles.secondaryAction} href="/cennik">
                Program pilotażowy
              </Link>
            </div>
            <ul aria-label="Najważniejsze właściwości produktu" className={styles.heroFacts}>
              <li>
                <CheckGlyph /> Własny proces
              </li>
              <li>
                <CheckGlyph /> Bez integracji IT
              </li>
              <li>
                <CheckGlyph /> Dla firm usługowych
              </li>
            </ul>
          </div>

          <HeroProductScene />
        </div>

        <nav aria-label="Etapy produktu" className={styles.journeyRail} data-product-section-nav>
          <p>Od konfiguracji do decyzji</p>
          <ol>
            {journey.map(([number, label, href]) => (
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

      <ProductChapter
        description="Edytor odtwarza sposób kwalifikacji, który naprawdę działa w firmie. Zamiast ogólnego formularza powstaje proces oparty na realnym zakresie usługi."
        eyebrow="Budowa procesu"
        facts={builderFacts}
        heading={
          <>
            <strong>Najpierw ustalasz,</strong>
            <span>o co naprawdę trzeba zapytać</span>
          </>
        }
        id="proces"
        imageAlt="Edytor procesu Kwotum z listą sekcji, podglądem formularza i ustawieniami pytania"
        imageHeight={1025}
        imageSrc="/images/product/builder-kwotum-v1.webp"
        imageWidth={1400}
        mobileHeight={600}
        mobileSrc="/images/product/builder-kwotum-mobile-v1.webp"
        number="01"
      />

      <ProductChapter
        description="Klient odpowiada na pytania we właściwej kolejności. Po zakończeniu otrzymuje orientacyjny wynik oraz prostą informację, co wydarzy się dalej."
        eyebrow="Po stronie klienta"
        facts={widgetFacts}
        heading={
          <>
            <strong>Krótki proces dla klienta.</strong>
            <span>Pełny kontekst dla firmy</span>
          </>
        }
        id="doswiadczenie-klienta"
        imageAlt="Widok wyniku procesu Kwotum z orientacyjnym przedziałem i formularzem kontaktowym"
        imageHeight={1025}
        imageSrc="/images/product/widget-result-kwotum-v1.webp"
        imageWidth={1350}
        mobileHeight={600}
        mobileSrc="/images/product/widget-result-kwotum-mobile-v1.webp"
        number="02"
        tinted
      />

      <ProductChapter
        description="Handlowiec od razu widzi usługę, zakres, budżet, termin, lokalizację i materiały — razem z wyjaśnieniem, dlaczego zapytanie pasuje."
        eyebrow="Po stronie firmy"
        facts={leadFacts}
        heading={
          <>
            <strong>Wszystkie odpowiedzi</strong>
            <span>w jednym, czytelnym rekordzie</span>
          </>
        }
        id="lead"
        imageAlt="Szczegóły leada w Kwotum z budżetem, terminem, lokalizacją i materiałami"
        imageHeight={1025}
        imageSrc="/images/product/lead-detail-kwotum-v1.webp"
        imageWidth={1210}
        mobileHeight={650}
        mobileSrc="/images/product/lead-detail-kwotum-mobile-v1.webp"
        number="03"
      />

      <section
        aria-labelledby="responsibility-title"
        className={styles.responsibility}
        id="odpowiedzialnosc"
      >
        <header className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Zakres odpowiedzialności</p>
          <h2 className="wy-marketing-heading-2" id="responsibility-title">
            <strong>System porządkuje decyzję.</strong>
            <span>Nie podejmuje jej za firmę</span>
          </h2>
          <p>
            Kwotum przygotowuje wiarygodny kontekst do rozmowy. Ostateczna weryfikacja, oferta i
            realizacja zawsze pozostają po stronie firmy.
          </p>
        </header>

        <div className={styles.responsibilityPanel}>
          <article data-product-responsibility>
            <span className={styles.responsibilityNumber}>01</span>
            <div>
              <p>Odpowiada Kwotum</p>
              <h3 className="wy-marketing-heading-3">Porządkuje i wyjaśnia</h3>
              <ul>
                <li>
                  <CheckGlyph /> prowadzi proces i zapisuje odpowiedzi,
                </li>
                <li>
                  <CheckGlyph /> potwierdza wynik reguł po stronie serwera,
                </li>
                <li>
                  <CheckGlyph /> tworzy uporządkowany rekord leada.
                </li>
              </ul>
            </div>
          </article>
          <article data-product-responsibility>
            <span className={styles.responsibilityNumber}>02</span>
            <div>
              <p>Odpowiada firma</p>
              <h3 className="wy-marketing-heading-3">Weryfikuje i decyduje</h3>
              <ul>
                <li>
                  <CheckGlyph /> ustala pytania i kryteria kwalifikacji,
                </li>
                <li>
                  <CheckGlyph /> weryfikuje zakres przed przygotowaniem oferty,
                </li>
                <li>
                  <CheckGlyph /> prowadzi kontakt, sprzedaż i realizację.
                </li>
              </ul>
            </div>
          </article>
          <p className={styles.disclaimer}>
            Wynik prezentowany klientowi jest orientacyjny i nie stanowi wiążącej oferty.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="product-cta-title"
        className={styles.finalCta}
        id="product-final-cta"
      >
        <div className={styles.finalPanel}>
          <div className={styles.finalBrand}>
            <Image alt="" aria-hidden="true" height={30} src="/kwotum-logo-v3.png" width={30} />
            <strong>kwotum</strong>
          </div>
          <div className={styles.finalCopy}>
            <p className={styles.eyebrow}>Następny krok</p>
            <h2 className="wy-marketing-heading-2" id="product-cta-title">
              Zobacz cały proces na konkretnym przykładzie.
            </h2>
            <p className="wy-marketing-lead">
              Przejdź od pierwszego pytania klienta do informacji, które otrzymuje firma po wysłaniu
              formularza.
            </p>
            <div className={styles.actions}>
              <Link className={styles.primaryAction} href="/jak-dziala">
                Przejdź przez proces
              </Link>
              <Link className={styles.secondaryAction} href="/branze">
                Zobacz zastosowania
              </Link>
            </div>
          </div>
          <ul aria-label="Zakres przykładowego procesu" className={styles.finalFacts}>
            <li>
              <strong>5</strong>
              <span>grup informacji o leadzie</span>
            </li>
            <li>
              <strong>1</strong>
              <span>uporządkowany rekord</span>
            </li>
            <li>
              <strong>100%</strong>
              <span>wyjaśnialne reguły wyniku</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function HeroProductScene() {
  return (
    <figure className={styles.heroScene} data-product-hero-proof>
      <div className={styles.sceneGlow} />
      <div className={styles.dashboardFrame}>
        <ScreenChrome label="Panel firmy" />
        <Image
          alt="Panel Kwotum z przeglądem leadów, procesów i wyników"
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
          alt="Mobilna lista leadów w panelu Kwotum"
          className={styles.mobileImage}
          height={600}
          priority
          sizes="(max-width: 640px) calc(100vw - 32px), 220px"
          src="/images/product/dashboard-kwotum-mobile-v1.webp"
          width={390}
        />
      </div>
      <figcaption>
        <span>Panel Kwotum</span>
        <span>Dane demonstracyjne</span>
      </figcaption>
    </figure>
  );
}

function ProductChapter({
  description,
  eyebrow,
  facts,
  heading,
  id,
  imageAlt,
  imageHeight,
  imageSrc,
  imageWidth,
  mobileHeight,
  mobileSrc,
  number,
  tinted = false,
}: {
  description: string;
  eyebrow: string;
  facts: readonly string[];
  heading: React.ReactNode;
  id: string;
  imageAlt: string;
  imageHeight: number;
  imageSrc: string;
  imageWidth: number;
  mobileHeight: number;
  mobileSrc: string;
  number: string;
  tinted?: boolean;
}) {
  const titleId = `${id}-title`;

  return (
    <section
      aria-labelledby={titleId}
      className={`${styles.chapter} ${tinted ? styles.chapterTinted : ""}`}
      data-product-feature
      id={id}
    >
      <header className={styles.sectionHeading}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className="wy-marketing-heading-2" id={titleId}>
          {heading}
        </h2>
        <p className="wy-marketing-lead">{description}</p>
      </header>

      <figure className={styles.productStage} data-product-screen>
        <span aria-hidden="true" className={styles.stageNumber}>
          {number}
        </span>
        <div className={styles.screenWindow}>
          <ScreenChrome label="Kwotum" />
          <Image
            alt={imageAlt}
            className={styles.desktopScreenImage}
            height={imageHeight}
            sizes="(max-width: 760px) 1px, 1260px"
            src={imageSrc}
            width={imageWidth}
          />
          <Image
            alt={imageAlt}
            className={styles.mobileScreenImage}
            height={mobileHeight}
            sizes="(max-width: 760px) calc(100vw - 48px), 1px"
            src={mobileSrc}
            width={390}
          />
        </div>
        <figcaption>Dane demonstracyjne</figcaption>
      </figure>

      <ul aria-label={`Najważniejsze możliwości: ${eyebrow}`} className={styles.factRail}>
        {facts.map((fact, index) => (
          <li key={fact}>
            <span>0{index + 1}</span>
            <strong>{fact}</strong>
          </li>
        ))}
      </ul>
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
