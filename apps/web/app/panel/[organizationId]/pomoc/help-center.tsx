"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { PanelIcon } from "../../panel-icon";
import {
  filterHelpGuides,
  HELP_CATEGORIES,
  type HelpCategoryId,
  type HelpGuide,
} from "./help-content";

const ROLE_LABELS = {
  admin: "Administrator",
  owner: "Właściciel",
  sales: "Sprzedaż",
} as const;

export function HelpCenter({
  guides,
  role,
}: Readonly<{
  guides: ReadonlyArray<HelpGuide>;
  role: keyof typeof ROLE_LABELS;
}>) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const filteredGuides = useMemo(
    () => filterHelpGuides(guides, deferredQuery),
    [deferredQuery, guides],
  );
  const categories = HELP_CATEGORIES.filter((category) =>
    filteredGuides.some((guide) => guide.category === category.id),
  );
  const quickGuides = ["first-launch", "lead-detail", "publish-share"]
    .map((id) => guides.find((guide) => guide.id === id))
    .filter((guide): guide is HelpGuide => Boolean(guide))
    .slice(0, 3);

  return (
    <div className="help-center">
      <section aria-labelledby="help-search-title" className="help-center__intro">
        <div>
          <span className="help-center__role">Zakres poradnika: {ROLE_LABELS[role]}</span>
          <h2 id="help-search-title">Jak możemy Ci pomóc?</h2>
          <p>
            Znajdź konkretną czynność albo przejdź przez instrukcje w kolejności, w której pracujesz
            w panelu.
          </p>
        </div>
        <label className="help-center__search">
          <span className="wy-sr-only">Szukaj w poradniku</span>
          <PanelIcon name="search" />
          <input
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Szukaj: lead, publikacja, WordPress…"
            type="search"
            value={query}
          />
          {query ? (
            <button aria-label="Wyczyść wyszukiwanie" onClick={() => setQuery("")} type="button">
              <PanelIcon name="close" />
            </button>
          ) : null}
        </label>
      </section>

      {query ? null : (
        <section aria-labelledby="help-quick-title" className="help-center__quick">
          <div className="help-center__section-heading">
            <span>Szybkie ścieżki</span>
            <h2 id="help-quick-title">Najczęstsze cele</h2>
          </div>
          <div className="help-center__quick-links">
            {quickGuides.map((guide, index) => (
              <a href={`#guide-${guide.id}`} key={guide.id}>
                <span aria-hidden="true">0{index + 1}</span>
                <strong>{guide.title}</strong>
                <PanelIcon name="arrow-right" />
              </a>
            ))}
          </div>
        </section>
      )}

      <p aria-live="polite" className="help-center__results">
        {query
          ? `${filteredGuides.length} ${resultWord(filteredGuides.length)} dla „${query.trim()}”`
          : `${guides.length} instrukcji dostępnych dla Twojej roli`}
      </p>

      {filteredGuides.length === 0 ? (
        <section className="help-center__empty">
          <PanelIcon name="search" />
          <h2>Nie znaleźliśmy takiej instrukcji</h2>
          <p>Spróbuj krótszego hasła, nazwy modułu albo czynności, którą chcesz wykonać.</p>
          <button onClick={() => setQuery("")} type="button">
            Pokaż cały poradnik
          </button>
        </section>
      ) : (
        <div className="help-center__layout">
          <aside aria-label="Spis treści poradnika" className="help-center__index">
            <span>Spis treści</span>
            <nav aria-label="Spis treści poradnika">
              {categories.map((category) => {
                const count = filteredGuides.filter(
                  (guide) => guide.category === category.id,
                ).length;
                return (
                  <a href={`#help-category-${category.id}`} key={category.id}>
                    <span>
                      <PanelIcon name={category.icon} />
                      {category.label}
                    </span>
                    <small>{count}</small>
                  </a>
                );
              })}
            </nav>
          </aside>

          <div className="help-center__content">
            {categories.map((category) => (
              <HelpCategory
                categoryId={category.id}
                description={category.description}
                guides={filteredGuides.filter((guide) => guide.category === category.id)}
                icon={category.icon}
                key={category.id}
                label={category.label}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HelpCategory({
  categoryId,
  description,
  guides,
  icon,
  label,
}: Readonly<{
  categoryId: HelpCategoryId;
  description: string;
  guides: ReadonlyArray<HelpGuide>;
  icon: Parameters<typeof PanelIcon>[0]["name"];
  label: string;
}>) {
  return (
    <section className="help-category" id={`help-category-${categoryId}`}>
      <header className="help-category__heading">
        <span aria-hidden="true">
          <PanelIcon name={icon} />
        </span>
        <div>
          <h2>{label}</h2>
          <p>{description}</p>
        </div>
      </header>
      <div className="help-category__guides">
        {guides.map((guide, index) => (
          <details id={`guide-${guide.id}`} key={guide.id} open={index === 0}>
            <summary>
              <span>
                <strong>{guide.title}</strong>
                <small>{guide.summary}</small>
              </span>
              <PanelIcon name="chevron-down" />
            </summary>
            <div className="help-guide__body">
              <ol>
                {guide.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              {guide.note ? (
                <p className="help-guide__note">
                  <PanelIcon name="info" />
                  <span>{guide.note}</span>
                </p>
              ) : null}
              <Link href={guide.href}>
                {guide.hrefLabel}
                <PanelIcon name="arrow-right" />
              </Link>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function resultWord(count: number): string {
  if (count === 1) return "wynik";
  if (count >= 2 && count <= 4) return "wyniki";
  return "wyników";
}
