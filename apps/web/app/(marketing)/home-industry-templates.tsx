"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import styles from "./home-industry-templates.module.css";

type IndustryTemplate = {
  contains: readonly string[];
  description: string;
  href: string;
  id: string;
  lead: readonly (readonly [string, string])[];
  meta: string;
  name: string;
  path: readonly string[];
  receives: readonly string[];
  score: number;
  visualLabel: string;
  visualVariant: keyof Pick<
    typeof styles,
    "visualClimate" | "visualFence" | "visualFurniture" | "visualRenovation" | "visualWebsite"
  >;
};

const industryTemplates: readonly IndustryTemplate[] = [
  {
    contains: [
      "logicznie ułożone pytania",
      "warunki zależne od rodzaju zabudowy",
      "orientacyjny przedział ceny",
      "scoring jakości leada",
    ],
    description:
      "Proces prowadzi klienta od rodzaju zabudowy do danych potrzebnych do przygotowania pierwszej, rzeczowej rozmowy.",
    href: "/branze/meble-na-wymiar",
    id: "furniture",
    lead: [
      ["Projekt", "Kuchnia w układzie L"],
      ["Wymiary", "około 8–10 mb"],
      ["Budżet", "35 000–50 000 zł"],
      ["Termin", "3–6 miesięcy"],
      ["Lokalizacja", "Płońsk"],
    ],
    meta: "Kuchnie, szafy, garderoby",
    name: "Meble na wymiar",
    path: [
      "Rodzaj zabudowy",
      "Układ i wymiary",
      "Materiały",
      "Budżet i termin",
      "Zdjęcia i kontakt",
    ],
    receives: [
      "zakres i przybliżone wymiary",
      "budżet, termin i lokalizację",
      "zdjęcia pomieszczenia",
      "jasno określony następny krok",
    ],
    score: 87,
    visualLabel: "Układ zabudowy",
    visualVariant: "visualFurniture",
  },
  {
    contains: [
      "wybór systemu i wypełnienia",
      "pytania o bramy oraz automatykę",
      "warunki montażu i ukształtowanie terenu",
      "orientacyjny przedział inwestycji",
    ],
    description:
      "Klient opisuje długość ogrodzenia, liczbę bram i warunki działki, zanim firma zaplanuje oględziny.",
    href: "/branze/ogrodzenia",
    id: "fences",
    lead: [
      ["Zakres", "Ogrodzenie panelowe"],
      ["Długość", "około 42 m"],
      ["Bramy", "Przesuwna + furtka"],
      ["Automatyka", "Tak"],
      ["Lokalizacja", "Otwock"],
    ],
    meta: "Typ, długość, automatyka",
    name: "Ogrodzenia i bramy",
    path: ["Typ ogrodzenia", "Długość", "Bramy", "Teren i montaż", "Kontakt"],
    receives: [
      "typ i orientacyjną długość",
      "liczbę bram oraz furtek",
      "informacje o automatyce",
      "opis do przygotowania oględzin",
    ],
    score: 82,
    visualLabel: "Zakres ogrodzenia",
    visualVariant: "visualFence",
  },
  {
    contains: [
      "cel biznesowy i typ projektu",
      "zakres podstron oraz funkcji",
      "integracje i materiały klienta",
      "budżet oraz oczekiwany termin",
    ],
    description:
      "Proces porządkuje cele, zakres i funkcje strony lub aplikacji, aby brief nie kończył się na pytaniu o cenę.",
    href: "/branze/strony-internetowe",
    id: "websites",
    lead: [
      ["Projekt", "Serwis usługowy"],
      ["Zakres", "8–12 podstron"],
      ["Funkcje", "Formularz + CRM"],
      ["Budżet", "25 000–40 000 zł"],
      ["Termin", "Do 4 miesięcy"],
    ],
    meta: "Zakres, funkcje, budżet",
    name: "Strony i aplikacje",
    path: ["Cel projektu", "Zakres", "Funkcje", "Materiały", "Budżet i kontakt"],
    receives: [
      "cel i oczekiwany efekt",
      "listę potrzebnych funkcji",
      "status treści i identyfikacji",
      "brief gotowy do estymacji",
    ],
    score: 85,
    visualLabel: "Mapa serwisu",
    visualVariant: "visualWebsite",
  },
  {
    contains: [
      "rodzaj obiektu i liczbę pomieszczeń",
      "metraż oraz ekspozycję",
      "warunki prowadzenia instalacji",
      "preferowany termin montażu",
    ],
    description:
      "Klient podaje pomieszczenia, metraż i warunki montażu, dzięki czemu firma szybciej ocenia potrzebny zakres wizji lokalnej.",
    href: "/branze/klimatyzacja",
    id: "climate",
    lead: [
      ["Obiekt", "Dom jednorodzinny"],
      ["Pomieszczenia", "Salon + 2 sypialnie"],
      ["Metraż", "około 68 m²"],
      ["Montaż", "Nowa instalacja"],
      ["Lokalizacja", "Warszawa"],
    ],
    meta: "Pomieszczenia, metraż, montaż",
    name: "Klimatyzacja",
    path: ["Obiekt", "Pomieszczenia", "Metraż", "Warunki montażu", "Kontakt"],
    receives: [
      "liczbę i rodzaj pomieszczeń",
      "przybliżony metraż",
      "informacje o instalacji",
      "kontekst do doboru urządzeń",
    ],
    score: 79,
    visualLabel: "Strefy klimatyzacji",
    visualVariant: "visualClimate",
  },
  {
    contains: [
      "rodzaj i stan nieruchomości",
      "zakres prac w pomieszczeniach",
      "standard oraz odpowiedzialność za materiały",
      "termin i dostępność lokalu",
    ],
    description:
      "Proces rozdziela zakres prac, stan lokalu i standard wykończenia, zanim ekipa podejmie decyzję o oględzinach.",
    href: "/branze/remonty",
    id: "renovations",
    lead: [
      ["Zakres", "Remont mieszkania"],
      ["Metraż", "około 54 m²"],
      ["Stan", "Rynek wtórny"],
      ["Standard", "Podwyższony"],
      ["Termin", "Jesień 2026"],
    ],
    meta: "Zakres, stan, materiały",
    name: "Remonty",
    path: ["Nieruchomość", "Zakres prac", "Metraż", "Standard", "Termin i kontakt"],
    receives: [
      "zakres prac według pomieszczeń",
      "metraż i stan nieruchomości",
      "standard oraz materiały",
      "podstawę do zaplanowania oględzin",
    ],
    score: 81,
    visualLabel: "Plan prac",
    visualVariant: "visualRenovation",
  },
] as const;

export function HomeIndustryTemplates() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeTemplate = industryTemplates[activeIndex]!;

  function selectTab(index: number, focus = false) {
    setActiveIndex(index);
    if (focus) {
      tabRefs.current[index]?.focus();
    }
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = industryTemplates.length - 1;
    let nextIndex: number | null = null;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = index === lastIndex ? 0 : index + 1;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = index === 0 ? lastIndex : index - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      selectTab(nextIndex, true);
    }
  }

  return (
    <figure className={styles.shell} data-home-proof="industry-processes">
      <figcaption className="wy-sr-only">
        Przełączane demonstracyjne szablony procesów dla pięciu branż usługowych.
      </figcaption>

      <div aria-label="Wybierz szablon branżowy" className={styles.navigation} role="tablist">
        {industryTemplates.map((template, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              aria-controls={`industry-panel-${template.id}`}
              aria-selected={isActive}
              className={isActive ? styles.navigationActive : undefined}
              id={`industry-tab-${template.id}`}
              key={template.id}
              onClick={() => {
                selectTab(index);
              }}
              onKeyDown={(event) => {
                handleTabKeyDown(event, index);
              }}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>
                <strong>{template.name}</strong>
                <small>{template.meta}</small>
              </span>
              <span aria-hidden="true">→</span>
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`industry-tab-${activeTemplate.id}`}
        className={styles.detail}
        id={`industry-panel-${activeTemplate.id}`}
        role="tabpanel"
      >
        <div className={styles.main}>
          <span className={styles.badge}>Aktywny szablon</span>
          <h3>{activeTemplate.name}</h3>
          <p>{activeTemplate.description}</p>

          <ol
            aria-label={`Przebieg procesu: ${activeTemplate.name}`}
            className={styles.path}
            tabIndex={0}
          >
            {activeTemplate.path.map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                <strong>{step}</strong>
                {index < activeTemplate.path.length - 1 ? <span aria-hidden="true">→</span> : null}
              </li>
            ))}
          </ol>

          <div className={styles.columns}>
            <div>
              <strong>Proces zawiera</strong>
              <ul>
                {activeTemplate.contains.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Firma otrzymuje</strong>
              <ul>
                {activeTemplate.receives.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <Link className={styles.primaryLink} href={activeTemplate.href}>
            Zobacz proces: {activeTemplate.name.toLocaleLowerCase("pl-PL")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <aside aria-label={`Przykładowy lead: ${activeTemplate.name}`} className={styles.preview}>
          <div
            aria-label={`${activeTemplate.visualLabel} — ilustracja interfejsowa`}
            className={`${styles.visual} ${styles[activeTemplate.visualVariant]}`}
            role="img"
          >
            <span>{activeTemplate.visualLabel}</span>
            <i />
            <i />
            <i />
            <i />
          </div>

          <div className={styles.leadCard}>
            <header>
              <strong>Przykładowy lead</strong>
              <span>Dane demo</span>
            </header>
            <div className={styles.score}>
              <strong>
                {activeTemplate.score}
                <small>/100</small>
              </strong>
              <span>Dobre dopasowanie</span>
            </div>
            <dl>
              {activeTemplate.lead.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </figure>
  );
}
