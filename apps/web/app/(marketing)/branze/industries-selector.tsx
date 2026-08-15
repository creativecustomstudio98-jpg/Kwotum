"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { industries } from "../../../lib/marketing/content";
import styles from "./industries-page.module.css";

const contextLabels = [
  "zabudowa, materiały, termin",
  "teren, bramy, montaż",
  "cel, funkcje, treści",
  "pomieszczenia, instalacja",
  "stan, zakres, logistyka",
] as const;

export function IndustriesSelector() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndustry = industries[activeIndex]!;

  function select(index: number, focus = false) {
    setActiveIndex(index);
    if (focus) {
      tabRefs.current[index]?.focus();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = industries.length - 1;
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = index === lastIndex ? 0 : index + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = index === 0 ? lastIndex : index - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      select(nextIndex, true);
    }
  }

  return (
    <div className={styles.selector} data-industries-selector>
      <div aria-label="Wybierz branżę do porównania" className={styles.selectorTabs} role="tablist">
        {industries.map((industry, index) => (
          <button
            aria-controls={`industry-context-${industry.slug}`}
            aria-selected={index === activeIndex}
            className={index === activeIndex ? styles.selectorTabActive : undefined}
            id={`industry-context-tab-${industry.slug}`}
            key={industry.slug}
            onClick={() => {
              select(index);
            }}
            onKeyDown={(event) => {
              handleKeyDown(event, index);
            }}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            role="tab"
            tabIndex={index === activeIndex ? 0 : -1}
            type="button"
          >
            <span>0{index + 1}</span>
            <strong>{industry.name}</strong>
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`industry-context-tab-${activeIndustry.slug}`}
        className={styles.selectorPanel}
        id={`industry-context-${activeIndustry.slug}`}
        role="tabpanel"
      >
        <div
          aria-label={`Przykładowa realizacja: ${activeIndustry.name}`}
          className={`${styles.selectorVisual} ${styles[`selectorVisual${activeIndex + 1}`]}`}
          role="img"
        >
          <span>
            <small>Zakres branżowy</small>
            <strong>{contextLabels[activeIndex]}</strong>
          </span>
        </div>

        <div className={styles.selectorCopy}>
          <p>
            0{activeIndex + 1} <span>/ 05</span>
          </p>
          <h3>{activeIndustry.name}</h3>
          <p>{activeIndustry.description}</p>

          <div className={styles.selectorQuestions}>
            <small>Proces zaczyna od</small>
            <ol>
              {activeIndustry.questions.slice(0, 3).map((question, index) => (
                <li key={question}>
                  <span>0{index + 1}</span>
                  {question}
                </li>
              ))}
            </ol>
          </div>

          <Link href={`/branze/${activeIndustry.slug}`}>
            Zobacz pełny przykład
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
