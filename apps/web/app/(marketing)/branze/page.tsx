import Image from "next/image";
import Link from "next/link";

import { industries } from "../../../lib/marketing/content";
import { marketingMetadata } from "../../../lib/marketing/metadata";
import { IndustriesSelector } from "./industries-selector";
import styles from "./industries-page.module.css";

export const metadata = marketingMetadata(
  "Procesy i formularze dla pięciu branż usługowych",
  "Porównaj procesy dla mebli na wymiar, ogrodzeń, stron internetowych, klimatyzacji i remontów. Zobacz pytania oraz przykładowe briefy.",
  "/branze",
);

const panoramaItems = [
  ["Meble", "zabudowa i materiały"],
  ["Ogrodzenia", "teren, bramy i montaż"],
  ["Strony WWW", "cel, funkcje i treści"],
  ["Klimatyzacja", "pomieszczenia i instalacja"],
  ["Remonty", "stan, zakres i logistyka"],
] as const;

const sharedPrinciples = [
  ["01", "Inne dane wejściowe", "Pytania wynikają z realnego zakresu usługi"],
  ["02", "Wspólne potwierdzenie", "Publikację i wynik kontroluje serwer"],
  ["03", "Właściwy brief", "Firma otrzymuje kontekst do następnego kroku"],
] as const;

export default function IndustriesPage() {
  return (
    <div className={`${styles.page} wy-marketing-v7-theme`}>
      <section
        aria-labelledby="industries-hero-title"
        className={styles.hero}
        data-industries-hero
        id="industries-hero"
      >
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy} data-industries-hero-copy>
            <p className={styles.eyebrow}>Procesy dopasowane do branży</p>
            <h1 className="wy-marketing-heading-1" id="industries-hero-title">
              <strong>Meble to nie remont.</strong> <span>Brief też nie powinien być ten sam.</span>
            </h1>
            <p className={`${styles.heroDescription} wy-marketing-lead`}>
              Każda usługa wymaga innych danych przed pierwszą rozmową. Kwotum zachowuje wspólny,
              bezpieczny mechanizm, ale zaczyna od pytań właściwych dla konkretnego zakresu.
            </p>
            <div className={styles.actions} data-industries-actions>
              <Link className={styles.primaryAction} href="#porownanie">
                Porównaj pięć procesów
              </Link>
              <Link className={styles.secondaryAction} href="/jak-dziala">
                Zobacz wspólny mechanizm
              </Link>
            </div>
            <ul aria-label="Zakres strony branżowej" className={styles.heroFacts}>
              <li>
                <CheckGlyph /> Pięć dopracowanych zastosowań
              </li>
              <li>
                <CheckGlyph /> Prawdziwe trasy szczegółowe
              </li>
              <li>
                <CheckGlyph /> Decyzja nadal należy do firmy
              </li>
            </ul>
          </div>

          <IndustryPanorama />
        </div>

        <ol aria-label="Stały kontrakt procesów branżowych" className={styles.principleRail}>
          {sharedPrinciples.map(([number, title, description]) => (
            <li key={number}>
              <span>{number}</span>
              <div>
                <strong>{title}</strong>
                <small>{description}</small>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="industries-compare-title"
        className={styles.explorer}
        data-industries-explorer
        id="porownanie"
      >
        <header className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Porównaj procesy</p>
          <h2 className="wy-marketing-heading-2" id="industries-compare-title">
            <strong>Wspólny silnik.</strong> <span>Inny zakres danych.</span>
          </h2>
          <p className="wy-marketing-lead">
            Przełącz branżę i zobacz, jak zmieniają się pytania, ścieżka oraz zawartość
            przykładowego leada. Mechanizm publikacji i kwalifikacji pozostaje ten sam.
          </p>
        </header>

        <div className={styles.explorerProof} data-industries-proof>
          <IndustriesSelector />
        </div>
      </section>

      <section
        aria-labelledby="industries-index-title"
        className={styles.indexSection}
        data-industries-index
        id="zastosowania"
      >
        <header className={styles.indexHeading}>
          <div>
            <p className={styles.eyebrow}>Pięć zastosowań</p>
            <h2 className="wy-marketing-heading-2" id="industries-index-title">
              <strong>Wybierz usługę.</strong> <span>Zobacz pełny przykład.</span>
            </h2>
          </div>
          <p className="wy-marketing-lead">
            Każda trasa pokazuje właściwe pytania, demonstracyjny brief i granice wyniku dla
            konkretnego typu realizacji.
          </p>
        </header>

        <ol className={styles.industryIndex}>
          {industries.map((industry, index) => (
            <li key={industry.slug}>
              <Link href={`/branze/${industry.slug}`}>
                <span className={styles.indexNumber}>0{index + 1}</span>
                <span
                  aria-label={`Przykładowa realizacja: ${industry.name}`}
                  className={`${styles.industryVisual} ${styles[`industryVisual${index + 1}`]}`}
                  role="img"
                />
                <span className={styles.industryCopy}>
                  <small>{industry.eyebrow}</small>
                  <strong>{industry.name}</strong>
                  <span>{industry.description}</span>
                </span>
                <span className={styles.industryInputs}>
                  <small>Brief zbiera między innymi</small>
                  <span>
                    {industry.questions.slice(0, 3).map((question) => (
                      <span key={question}>{question}</span>
                    ))}
                  </span>
                </span>
                <span aria-hidden="true" className={styles.indexArrow}>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <IndustriesFinalCta />
    </div>
  );
}

function IndustryPanorama() {
  return (
    <figure
      aria-labelledby="industries-panorama-title"
      className={styles.panorama}
      data-industries-panorama
    >
      <figcaption className="wy-sr-only" id="industries-panorama-title">
        Pięć branż usługowych: meble na wymiar, ogrodzenia, strony internetowe, klimatyzacja i
        remonty.
      </figcaption>
      <div aria-hidden="true" className={styles.panoramaGlow} />
      <div className={styles.panoramaImages}>
        {panoramaItems.map(([name, description], index) => (
          <div className={styles[`panoramaImage${index + 1}`]} key={name}>
            <span>
              <strong>{name}</strong>
              <small>{description}</small>
            </span>
          </div>
        ))}
      </div>
      <div className={styles.panoramaSummary}>
        <span>5</span>
        <p>
          <strong>gotowych kontekstów</strong>
          <small>jeden kontrolowany mechanizm</small>
        </p>
      </div>
    </figure>
  );
}

function IndustriesFinalCta() {
  return (
    <section
      aria-labelledby="industries-final-title"
      className={styles.finalCta}
      id="industries-final-cta"
    >
      <div className={styles.finalPanel}>
        <div className={styles.finalBrand}>
          <Image alt="" aria-hidden="true" height={30} src="/kwotum-logo-v3.png" width={30} />
          <strong>kwotum</strong>
        </div>
        <div className={styles.finalCopy}>
          <p className={styles.eyebrow}>Własny proces</p>
          <h2 className="wy-marketing-heading-2" id="industries-final-title">
            Branża ustala pytania. <span>Ty zachowujesz decyzję.</span>
          </h2>
          <p className="wy-marketing-lead">
            Gotowy kontekst jest punktem startowym. Pytania, reguły i następny krok możesz dopasować
            do rzeczywistej oferty firmy.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/jak-dziala#proces">
              Zobacz, jak ułożyć proces
            </Link>
            <Link className={styles.secondaryAction} href="/logowanie" prefetch={false}>
              Przejdź do panelu
            </Link>
          </div>
        </div>

        <aside
          aria-labelledby="industries-overview-title"
          className={styles.finalOverview}
          data-industries-overview
        >
          <p>Stały rdzeń procesu</p>
          <h3 className="wy-marketing-heading-3" id="industries-overview-title">
            Różne usługi. Ten sam standard danych.
          </h3>
          <dl>
            <div>
              <dt>Pytania</dt>
              <dd>Zależne od zakresu konkretnej usługi</dd>
            </div>
            <div>
              <dt>Mechanizm</dt>
              <dd>Publikacja i wynik potwierdzane przez serwer</dd>
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

function CheckGlyph() {
  return (
    <span aria-hidden="true" className={styles.checkGlyph}>
      <svg fill="none" viewBox="0 0 16 16">
        <path d="m3.5 8.2 2.7 2.7 6.3-6.3" />
      </svg>
    </span>
  );
}
