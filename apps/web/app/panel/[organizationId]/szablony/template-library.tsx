"use client";

import { Button } from "@wyceno/ui";
import { useMemo, useState } from "react";

import { PanelIcon } from "../../panel-icon";
import { TemplateCreateForm } from "./template-create-form";

export type TemplateLibraryItem = Readonly<{
  description: string;
  industry: string;
  name: string;
  priority: boolean;
  questionCount: number;
  requiredQuestionCount: number;
  ruleCount: number;
  sectionTitles: readonly string[];
  slug: string;
  stepTitles: readonly string[];
}>;

type ComplexityFilter = "all" | "advanced" | "standard";
type SortOrder = "default" | "name" | "questions";

const applications: Readonly<Record<string, readonly string[]>> = {
  "meble-na-wymiar": ["Firmy stolarskie", "Studia meblowe", "Warsztaty rzemieślnicze"],
  ogrodzenia: ["Producenci ogrodzeń", "Ekipy montażowe", "Firmy budowlane"],
  "strony-internetowe": ["Agencje interaktywne", "Studia projektowe", "Freelancerzy"],
  klimatyzacja: ["Firmy instalacyjne", "Serwisy HVAC", "Doradcy techniczni"],
  remonty: ["Firmy remontowe", "Generalni wykonawcy", "Ekipy wykończeniowe"],
};

export function TemplateLibrary({
  organizationId,
  templates,
}: Readonly<{
  organizationId: string;
  templates: readonly TemplateLibraryItem[];
}>) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [complexity, setComplexity] = useState<ComplexityFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const [selectedSlug, setSelectedSlug] = useState(
    templates.find((template) => template.priority)?.slug ?? templates[0]?.slug ?? "",
  );
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);

  const categories = useMemo(
    () =>
      [...new Set(templates.map((template) => template.industry))].sort((left, right) =>
        left.localeCompare(right, "pl"),
      ),
    [templates],
  );
  const averageQuestionCount =
    templates.length === 0
      ? "0"
      : new Intl.NumberFormat("pl-PL", {
          maximumFractionDigits: 1,
          minimumFractionDigits: 1,
        }).format(
          templates.reduce((sum, template) => sum + template.questionCount, 0) / templates.length,
        );

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pl-PL");
    const filtered = templates.filter((template) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [template.industry, template.name, template.description].some((value) =>
          value.toLocaleLowerCase("pl-PL").includes(normalizedQuery),
        );
      const matchesCategory = category === "all" || template.industry === category;
      const templateComplexity = template.ruleCount > 0 ? "advanced" : "standard";
      const matchesComplexity = complexity === "all" || templateComplexity === complexity;

      return matchesQuery && matchesCategory && matchesComplexity;
    });

    return [...filtered].sort((left, right) => {
      if (sortOrder === "name") return left.industry.localeCompare(right.industry, "pl");
      if (sortOrder === "questions") return right.questionCount - left.questionCount;
      if (left.priority !== right.priority) return left.priority ? -1 : 1;
      return templates.indexOf(left) - templates.indexOf(right);
    });
  }, [category, complexity, query, sortOrder, templates]);

  const selectedTemplate =
    filteredTemplates.find((template) => template.slug === selectedSlug) ?? filteredTemplates[0];

  function selectTemplate(slug: string) {
    setSelectedSlug(slug);
    setFullPreviewOpen(false);
  }

  function resetFilters() {
    setQuery("");
    setCategory("all");
    setComplexity("all");
    setSortOrder("default");
  }

  return (
    <>
      <section aria-label="Filtry szablonów" className="template-toolbar">
        <label className="template-filter template-filter--search" htmlFor="template-search">
          <PanelIcon name="search" />
          <span className="wy-sr-only">Szukaj szablonu</span>
          <input
            id="template-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Szukaj szablonu…"
            type="search"
            value={query}
          />
        </label>
        <label className="template-filter" htmlFor="template-category">
          <PanelIcon name="folder" />
          <span className="wy-sr-only">Kategoria</span>
          <select
            id="template-category"
            onChange={(event) => setCategory(event.target.value)}
            value={category}
          >
            <option value="all">Wszystkie kategorie</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="template-filter" htmlFor="template-complexity">
          <span aria-hidden="true" className="template-filter__status-dot" />
          <span className="wy-sr-only">Złożoność</span>
          <select
            id="template-complexity"
            onChange={(event) => setComplexity(event.target.value as ComplexityFilter)}
            value={complexity}
          >
            <option value="all">Złożoność: Wszystkie</option>
            <option value="standard">Standardowe</option>
            <option value="advanced">Rozbudowane</option>
          </select>
        </label>
        <label className="template-filter" htmlFor="template-sort">
          <PanelIcon name="sort" />
          <span className="wy-sr-only">Sortowanie</span>
          <select
            id="template-sort"
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            value={sortOrder}
          >
            <option value="default">Sortuj: Polecane</option>
            <option value="name">Sortuj: Nazwa A–Z</option>
            <option value="questions">Sortuj: Najwięcej pytań</option>
          </select>
        </label>
        <p aria-live="polite" className="template-toolbar__result">
          Znaleziono: <strong>{filteredTemplates.length}</strong>
        </p>
      </section>

      <section aria-label="Podsumowanie biblioteki" className="template-summary-grid">
        <article className="template-summary-card template-summary-card--green">
          <span aria-hidden="true">
            <PanelIcon name="templates" />
          </span>
          <div>
            <small>Łącznie szablonów</small>
            <strong>{templates.length}</strong>
            <p>Gotowych punktów startowych</p>
          </div>
        </article>
        <article className="template-summary-card template-summary-card--amber">
          <span aria-hidden="true">
            <PanelIcon name="folder" />
          </span>
          <div>
            <small>Aktywne kategorie</small>
            <strong>{categories.length}</strong>
            <p>Każda z gotowym procesem</p>
          </div>
        </article>
        <article className="template-summary-card template-summary-card--blue">
          <span aria-hidden="true">
            <PanelIcon name="analytics" />
          </span>
          <div>
            <small>
              Średnio pytań <PanelIcon name="info" />
            </small>
            <strong>{averageQuestionCount}</strong>
            <p>Na jeden szablon</p>
          </div>
        </article>
      </section>

      {filteredTemplates.length === 0 ? (
        <section className="template-library-empty">
          <span aria-hidden="true">
            <PanelIcon name="search" />
          </span>
          <h2>Nie znaleziono szablonów</h2>
          <p>Zmień wyszukiwaną frazę albo wyczyść filtry.</p>
          <Button onClick={resetFilters} size="small" variant="secondary">
            Wyczyść filtry
          </Button>
        </section>
      ) : (
        <>
          <ul className="template-grid" id="template-library-grid">
            {filteredTemplates.map((template) => {
              const selected = template.slug === selectedTemplate?.slug;
              const advanced = template.ruleCount > 0;
              return (
                <li key={template.slug}>
                  <article
                    className={`template-card${selected ? " is-selected" : ""}`}
                    data-template-slug={template.slug}
                  >
                    <div
                      aria-hidden="true"
                      className={`template-card__media template-card__media--${template.slug}`}
                    >
                      {template.priority ? (
                        <span className="template-card__recommended">
                          <PanelIcon name="star" />
                          Polecany
                        </span>
                      ) : null}
                    </div>
                    <div className="template-card__body">
                      <h2>{template.industry}</h2>
                      <p className="template-card__name">{template.description}</p>
                      <div className="template-card__facts">
                        <dl>
                          <div>
                            <dt>Pytania</dt>
                            <dd>{template.questionCount}</dd>
                          </div>
                          <div>
                            <dt>Reguły</dt>
                            <dd>{template.ruleCount}</dd>
                          </div>
                        </dl>
                        <span
                          className={`template-complexity template-complexity--${
                            advanced ? "advanced" : "standard"
                          }`}
                        >
                          {advanced ? "Rozbudowany" : "Standardowy"}
                        </span>
                      </div>
                      <TemplateCreateForm
                        organizationId={organizationId}
                        templateName={template.name}
                        templateSlug={template.slug}
                      />
                      <button
                        aria-controls="template-details"
                        aria-pressed={selected}
                        className="template-card__preview"
                        onClick={() => selectTemplate(template.slug)}
                        type="button"
                      >
                        Podgląd
                      </button>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          {selectedTemplate ? (
            <section
              aria-labelledby="template-detail-title"
              className="template-detail"
              id="template-details"
            >
              <div
                aria-hidden="true"
                className={`template-detail__media template-card__media--${selectedTemplate.slug}`}
              />
              <div className="template-detail__description">
                <header>
                  <h2 id="template-detail-title">O szablonie: {selectedTemplate.industry}</h2>
                  <span>{selectedTemplate.ruleCount > 0 ? "Rozbudowany" : "Standardowy"}</span>
                </header>
                <p>{selectedTemplate.description}</p>
                <div className="template-detail__columns">
                  <section aria-labelledby="template-contains-title">
                    <h3 id="template-contains-title">Zawiera</h3>
                    <ul>
                      <li>
                        <PanelIcon name="check" />
                        {selectedTemplate.questionCount} pytań dla użytkownika
                      </li>
                      <li>
                        <PanelIcon name="check" />
                        {selectedTemplate.ruleCount}{" "}
                        {selectedTemplate.ruleCount === 1 ? "regułę przejścia" : "reguł przejścia"}
                      </li>
                      <li>
                        <PanelIcon name="check" />
                        {selectedTemplate.sectionTitles.length} sekcje procesu
                      </li>
                      <li>
                        <PanelIcon name="check" />
                        {selectedTemplate.requiredQuestionCount} pytań wymaganych
                      </li>
                    </ul>
                  </section>
                  <section aria-labelledby="template-applications-title">
                    <h3 id="template-applications-title">Zastosowanie</h3>
                    <ul>
                      {(applications[selectedTemplate.slug] ?? [selectedTemplate.industry]).map(
                        (application) => (
                          <li key={application}>
                            <PanelIcon name="user" />
                            {application}
                          </li>
                        ),
                      )}
                    </ul>
                  </section>
                </div>
              </div>
              <div className="template-detail__process">
                <h3>Podgląd procesu</h3>
                <ol>
                  {selectedTemplate.sectionTitles.slice(0, 4).map((section, index) => (
                    <li key={section}>
                      <span>
                        <PanelIcon
                          name={(["file", "money", "check", "templates"] as const)[index] ?? "file"}
                        />
                      </span>
                      <small>{section}</small>
                    </li>
                  ))}
                </ol>
                <Button
                  aria-controls="template-full-preview"
                  aria-expanded={fullPreviewOpen}
                  className="template-detail__preview-button"
                  onClick={() => setFullPreviewOpen((current) => !current)}
                  size="small"
                  variant="secondary"
                >
                  {fullPreviewOpen ? "Ukryj pełny podgląd" : "Pełny podgląd szablonu"}
                  <PanelIcon name={fullPreviewOpen ? "chevron-down" : "external"} />
                </Button>
              </div>
              {fullPreviewOpen ? (
                <div className="template-detail__questions" id="template-full-preview">
                  <header>
                    <h3>Pytania w szablonie</h3>
                    <p>Kolejność startowa — możesz ją później zmienić w builderze.</p>
                  </header>
                  <ol>
                    {selectedTemplate.stepTitles.map((title, index) => (
                      <li key={title}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{title}</strong>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </section>
          ) : null}
        </>
      )}
    </>
  );
}
