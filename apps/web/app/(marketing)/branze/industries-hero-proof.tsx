"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import styles from "./industries-hero-proof.module.css";

type IndustryProof = {
  href: string;
  id: string;
  inputs: readonly (readonly [string, string])[];
  lead: readonly (readonly [string, string])[];
  leadTitle: string;
  meta: string;
  name: string;
  nextStep: string;
  score: number;
  summary: string;
};

const proofs: readonly IndustryProof[] = [
  {
    href: "/branze/meble-na-wymiar",
    id: "furniture",
    inputs: [
      ["Rodzaj zabudowy", "Kuchnia"],
      ["Układ", "W kształcie L"],
      ["Wymiary", "około 8–10 mb"],
    ],
    lead: [
      ["Budżet", "35 000–50 000 zł"],
      ["Termin", "3–6 miesięcy"],
      ["Lokalizacja", "Płońsk"],
      ["Materiały", "fronty lakierowane"],
    ],
    leadTitle: "Kuchnia w układzie L",
    meta: "zabudowa · wymiary · materiały",
    name: "Meble na wymiar",
    nextStep: "Konsultacja projektowa",
    score: 87,
    summary: "Pytania prowadzą od rodzaju zabudowy do wymiarów, materiałów i budżetu.",
  },
  {
    href: "/branze/ogrodzenia",
    id: "fences",
    inputs: [
      ["System", "Ogrodzenie panelowe"],
      ["Długość", "około 42 m"],
      ["Brama", "przesuwna + furtka"],
    ],
    lead: [
      ["Automatyka", "tak"],
      ["Teren", "działka płaska"],
      ["Lokalizacja", "Otwock"],
      ["Montaż", "po stronie wykonawcy"],
    ],
    leadTitle: "Ogrodzenie z bramą",
    meta: "teren · długość · brama",
    name: "Ogrodzenia",
    nextStep: "Umówienie oględzin",
    score: 82,
    summary: "Proces rozdziela system, długość, bramy i warunki montażu na działce.",
  },
  {
    href: "/branze/strony-internetowe",
    id: "websites",
    inputs: [
      ["Typ projektu", "Serwis usługowy"],
      ["Zakres", "8–12 podstron"],
      ["Funkcje", "formularz + CRM"],
    ],
    lead: [
      ["Budżet", "25 000–40 000 zł"],
      ["Treści", "częściowo gotowe"],
      ["Termin", "do 4 miesięcy"],
      ["Integracje", "CRM i analityka"],
    ],
    leadTitle: "Serwis dla firmy usługowej",
    meta: "cel · funkcje · integracje",
    name: "Strony WWW",
    nextStep: "Warsztat zakresu",
    score: 85,
    summary: "Brief zaczyna się od celu biznesowego, a kończy na funkcjach i integracjach.",
  },
  {
    href: "/branze/klimatyzacja",
    id: "climate",
    inputs: [
      ["Obiekt", "Dom jednorodzinny"],
      ["Pomieszczenia", "salon + 2 sypialnie"],
      ["Powierzchnia", "około 68 m²"],
    ],
    lead: [
      ["Instalacja", "nowa"],
      ["Jednostki", "system multi-split"],
      ["Lokalizacja", "Warszawa"],
      ["Termin", "przed sezonem letnim"],
    ],
    leadTitle: "Klimatyzacja trzech stref",
    meta: "obiekt · metraż · montaż",
    name: "Klimatyzacja",
    nextStep: "Wizja lokalna",
    score: 79,
    summary: "Pytania zbierają pomieszczenia, metraż i warunki prowadzenia instalacji.",
  },
  {
    href: "/branze/remonty",
    id: "renovations",
    inputs: [
      ["Nieruchomość", "Mieszkanie"],
      ["Metraż", "około 54 m²"],
      ["Stan", "rynek wtórny"],
    ],
    lead: [
      ["Zakres", "remont kompleksowy"],
      ["Standard", "podwyższony"],
      ["Materiały", "do ustalenia"],
      ["Termin", "jesień 2026"],
    ],
    leadTitle: "Remont mieszkania 54 m²",
    meta: "zakres · stan · instalacje",
    name: "Remonty",
    nextStep: "Oględziny lokalu",
    score: 81,
    summary: "Proces oddziela stan lokalu, zakres prac i standard od otwartych niewiadomych.",
  },
] as const;

export function IndustriesHeroProof() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const active = proofs[activeIndex]!;

  function select(index: number, focus = false) {
    setActiveIndex(index);
    if (focus) tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = proofs.length - 1;
    let next: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = index === last ? 0 : index + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = index === 0 ? last : index - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = last;
    }

    if (next !== null) {
      event.preventDefault();
      select(next, true);
    }
  }

  return (
    <figure className={styles.shell} data-industries-proof>
      <figcaption className="wy-sr-only">
        Porównanie pytań branżowych, wspólnego mechanizmu Kwotum i gotowego briefu.
      </figcaption>

      <header className={styles.toolbar}>
        <span className={styles.brand}>
          <span aria-hidden="true" className={styles.brandMark} />
          Kwotum
        </span>
        <span className={styles.demoLabel}>Interaktywny przykład · dane demonstracyjne</span>
      </header>

      <div aria-label="Wybierz branżę" className={styles.tabs} role="tablist">
        {proofs.map((proof, index) => {
          const selected = activeIndex === index;

          return (
            <button
              aria-controls={`industries-proof-panel-${proof.id}`}
              aria-selected={selected}
              className={selected ? styles.tabActive : undefined}
              id={`industries-proof-tab-${proof.id}`}
              key={proof.id}
              onClick={() => select(index)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>
                <strong>{proof.name}</strong>
                <small>{proof.meta}</small>
              </span>
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`industries-proof-tab-${active.id}`}
        className={styles.workspace}
        id={`industries-proof-panel-${active.id}`}
        role="tabpanel"
      >
        <section className={styles.input}>
          <p className={styles.sectionLabel}>01 · Pytania dopasowane do usługi</p>
          <h2>{active.name}</h2>
          <p className={styles.summary}>{active.summary}</p>
          <dl className={styles.inputList}>
            {active.inputs.map(([label, value], index) => (
              <div key={label}>
                <dt>
                  <span aria-hidden="true">{index + 1}</span>
                  {label}
                </dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-label="Wspólny mechanizm Kwotum" className={styles.engine}>
          <p>Wspólny silnik</p>
          <span aria-hidden="true" className={styles.engineMark} />
          <ol>
            <li>
              <span>1</span>
              Zbiera
            </li>
            <li>
              <span>2</span>
              Porządkuje
            </li>
            <li>
              <span>3</span>
              Kwalifikuje
            </li>
          </ol>
          <small>Wynik i reguły potwierdza serwer</small>
        </section>

        <section className={styles.output}>
          <div className={styles.outputHeading}>
            <div>
              <p className={styles.sectionLabel}>02 · Gotowy brief</p>
              <h2>{active.leadTitle}</h2>
            </div>
            <span aria-label={`Wynik kwalifikacji ${active.score} na 100`} className={styles.score}>
              <strong>{active.score}</strong>
              <small>/100</small>
            </span>
          </div>
          <dl className={styles.leadList}>
            {active.lead.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.nextStep}>
            <span aria-hidden="true">✓</span>
            <div>
              <small>Zalecany kolejny krok</small>
              <strong>{active.nextStep}</strong>
            </div>
          </div>
          <Link className={styles.link} href={active.href}>
            Zobacz pełny przykład
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>

      <footer className={styles.contract}>
        <p>
          <strong>Zmienia się:</strong> pytania, zakres i zawartość briefu
        </p>
        <p>
          <strong>Wspólne:</strong> publikacja, kwalifikacja i prywatny panel
        </p>
      </footer>
    </figure>
  );
}
