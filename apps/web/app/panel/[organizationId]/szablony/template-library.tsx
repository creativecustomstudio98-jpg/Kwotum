"use client";

import { Badge, Button, EmptyState, Input, Select, StatusBadge } from "@wyceno/ui";
import { useEffect, useMemo, useRef, useState } from "react";

import { PanelPagination } from "../../panel-pagination";
import { paginateCollection } from "../../pagination-model";
import { PanelIcon } from "../../panel-icon";
import { TemplateCreateForm } from "./template-create-form";
import {
  filterTemplateLibrary,
  templateLibraryHref,
  type ComplexityFilter,
  type SortOrder,
  type TemplateLibraryFilters,
  type TemplateLibraryItem,
} from "./template-library-model";

export type { TemplateLibraryFilters, TemplateLibraryItem } from "./template-library-model";

const applications: Readonly<Record<string, readonly string[]>> = {
  "meble-na-wymiar": ["Firmy stolarskie", "Studia meblowe", "Warsztaty rzemieślnicze"],
  ogrodzenia: ["Producenci ogrodzeń", "Ekipy montażowe", "Firmy budowlane"],
  "strony-internetowe": ["Agencje interaktywne", "Studia projektowe", "Freelancerzy"],
  klimatyzacja: ["Firmy instalacyjne", "Serwisy HVAC", "Doradcy techniczni"],
  remonty: ["Firmy remontowe", "Generalni wykonawcy", "Ekipy wykończeniowe"],
};

const selectedTemplateHistoryKey = "__kwotumSelectedTemplateSlug";

export function TemplateLibrary({
  initialFilters,
  organizationId,
  templates,
}: Readonly<{
  initialFilters: TemplateLibraryFilters;
  organizationId: string;
  templates: readonly TemplateLibraryItem[];
}>) {
  const [filters, setFilters] = useState(initialFilters);
  const [selectedSlug, setSelectedSlug] = useState(
    templates.find((template) => template.priority)?.slug ?? templates[0]?.slug ?? "",
  );
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);
  const detailRef = useRef<HTMLElement>(null);
  const categories = useMemo(
    () =>
      [...new Set(templates.map((template) => template.industry))].sort((left, right) =>
        left.localeCompare(right, "pl"),
      ),
    [templates],
  );

  useEffect(() => {
    function syncFromHistory() {
      const parameters = new URLSearchParams(window.location.search);
      const category = parameters.get("category") ?? "all";
      const complexity = parameters.get("complexity");
      const sort = parameters.get("sort");
      const page = Number(parameters.get("page"));
      setFilters({
        category: category === "all" || categories.includes(category) ? category : "all",
        complexity: complexity === "advanced" || complexity === "standard" ? complexity : "all",
        page: Number.isSafeInteger(page) && page > 0 ? page : 1,
        query: (parameters.get("q") ?? "").slice(0, 80),
        sortOrder: sort === "name" || sort === "questions" ? sort : "default",
      });
      setFullPreviewOpen(false);
    }

    window.addEventListener("popstate", syncFromHistory);
    return () => window.removeEventListener("popstate", syncFromHistory);
  }, [categories]);

  useEffect(() => {
    const historyState = window.history.state;
    if (!historyState || typeof historyState !== "object") return;
    const savedSlug = (historyState as Record<string, unknown>)[selectedTemplateHistoryKey];
    if (typeof savedSlug === "string" && templates.some(({ slug }) => slug === savedSlug)) {
      // Odtworzenie wyboru z History API: stan zewnętrzny czytamy dopiero po
      // hydracji, bo na serwerze nie ma window.history. Lazy initializer
      // rozjechałby HTML serwera z klientem.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSlug(savedSlug);
    }
  }, [templates]);

  const filteredTemplates = useMemo(
    () => filterTemplateLibrary(templates, filters),
    [filters, templates],
  );
  const paginatedTemplates = useMemo(
    () => paginateCollection(filteredTemplates, filters.page, 8),
    [filteredTemplates, filters.page],
  );
  const selectedTemplate =
    paginatedTemplates.items.find((template) => template.slug === selectedSlug) ??
    paginatedTemplates.items[0];

  function updateFilters(
    changes: Partial<TemplateLibraryFilters>,
    historyMode: "push" | "replace" = "push",
  ) {
    const next: TemplateLibraryFilters = {
      ...filters,
      ...changes,
      page: changes.page ?? 1,
    };
    setFilters(next);
    setFullPreviewOpen(false);
    const href = templateLibraryHref(organizationId, next);
    const state = window.history.state;
    if (historyMode === "replace") window.history.replaceState(state, "", href);
    else window.history.pushState(state, "", href);
  }

  function selectTemplate(slug: string) {
    const historyState = window.history.state;
    const currentState =
      historyState && typeof historyState === "object"
        ? (historyState as Record<string, unknown>)
        : {};
    window.history.replaceState(
      { ...currentState, [selectedTemplateHistoryKey]: slug },
      "",
      window.location.href,
    );
    setSelectedSlug(slug);
    setFullPreviewOpen(false);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => detailRef.current?.focus());
    });
  }

  function resetFilters() {
    updateFilters(
      { category: "all", complexity: "all", page: 1, query: "", sortOrder: "default" },
      "replace",
    );
  }

  if (templates.length === 0) {
    return (
      <div className="record-list-empty template-library-empty">
        <EmptyState
          description="Biblioteka nie zawiera jeszcze żadnego gotowego punktu startowego."
          title="Brak dostępnych szablonów"
        />
      </div>
    );
  }

  return (
    <>
      <section aria-label="Filtry szablonów" className="template-toolbar">
        <label className="template-filter-control template-filter-control--search">
          <span>Szukaj</span>
          <Input
            aria-label="Szukaj szablonu"
            maxLength={80}
            onChange={(event) => updateFilters({ query: event.target.value }, "replace")}
            placeholder="Nazwa, branża lub opis…"
            type="search"
            value={filters.query}
          />
        </label>
        <label className="template-filter-control">
          <span>Kategoria</span>
          <Select
            aria-label="Kategoria"
            onChange={(event) => updateFilters({ category: event.target.value })}
            value={filters.category}
          >
            <option value="all">Wszystkie</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </label>
        <label className="template-filter-control">
          <span>Złożoność</span>
          <Select
            aria-label="Złożoność"
            onChange={(event) =>
              updateFilters({ complexity: event.target.value as ComplexityFilter })
            }
            value={filters.complexity}
          >
            <option value="all">Wszystkie</option>
            <option value="standard">Standardowe</option>
            <option value="advanced">Rozbudowane</option>
          </Select>
        </label>
        <label className="template-filter-control">
          <span>Sortowanie</span>
          <Select
            aria-label="Sortowanie"
            onChange={(event) => updateFilters({ sortOrder: event.target.value as SortOrder })}
            value={filters.sortOrder}
          >
            <option value="default">Polecane</option>
            <option value="name">Nazwa A–Z</option>
            <option value="questions">Najwięcej pytań</option>
          </Select>
        </label>
        <p aria-live="polite" className="template-toolbar__result">
          <strong>{filteredTemplates.length}</strong> {templateCountLabel(filteredTemplates.length)}
        </p>
      </section>

      {filteredTemplates.length === 0 ? (
        <section className="record-list-empty template-library-empty">
          <EmptyState
            action={
              <Button onClick={resetFilters} size="small" variant="secondary">
                Wyczyść filtry
              </Button>
            }
            description="Zmień wyszukiwaną frazę albo wyczyść filtry."
            title="Nie znaleziono szablonów"
          />
        </section>
      ) : (
        <>
          <div className="template-list-heading">
            <h2>Gotowe procesy</h2>
            <p>
              Strona {paginatedTemplates.page} z {paginatedTemplates.pageCount}
            </p>
          </div>
          <ul className="template-task-list" id="template-library-grid">
            {paginatedTemplates.items.map((template) => {
              const selected = template.slug === selectedTemplate?.slug;
              const advanced = template.ruleCount > 0;
              return (
                <li key={template.slug}>
                  <article
                    className={`template-card template-task-row${selected ? " is-selected" : ""}`}
                    data-template-slug={template.slug}
                  >
                    <div className="template-task-row__identity">
                      <div>
                        <h2>{template.industry}</h2>
                        {template.priority ? <Badge tone="success">Polecany</Badge> : null}
                      </div>
                      <p>{template.description}</p>
                    </div>
                    <dl className="template-task-row__facts">
                      <div>
                        <dt>Pytania</dt>
                        <dd>{template.questionCount}</dd>
                      </div>
                      <div>
                        <dt>Wymagane</dt>
                        <dd>{template.requiredQuestionCount}</dd>
                      </div>
                      <div>
                        <dt>Reguły</dt>
                        <dd>{template.ruleCount}</dd>
                      </div>
                    </dl>
                    <StatusBadge tone={advanced ? "warning" : "neutral"}>
                      {advanced ? "Rozbudowany" : "Standardowy"}
                    </StatusBadge>
                    <div className="template-task-row__actions">
                      <Button
                        aria-controls="template-details"
                        aria-pressed={selected}
                        onClick={() => selectTemplate(template.slug)}
                        size="small"
                        variant="secondary"
                      >
                        Podgląd
                      </Button>
                      <TemplateCreateForm
                        organizationId={organizationId}
                        templateSlug={template.slug}
                      />
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          <PanelPagination
            ariaLabel="Paginacja szablonów"
            currentPage={paginatedTemplates.page}
            hrefForPage={(page) => templateLibraryHref(organizationId, { ...filters, page })}
            pageCount={paginatedTemplates.pageCount}
          />

          {selectedTemplate ? (
            <section
              aria-labelledby="template-detail-title"
              className="template-detail"
              id="template-details"
              ref={detailRef}
              tabIndex={-1}
            >
              <header className="template-detail__heading">
                <div>
                  <span>Wybrany szablon</span>
                  <h2 id="template-detail-title">O szablonie: {selectedTemplate.industry}</h2>
                </div>
                <StatusBadge tone={selectedTemplate.ruleCount > 0 ? "warning" : "neutral"}>
                  {selectedTemplate.ruleCount > 0 ? "Rozbudowany" : "Standardowy"}
                </StatusBadge>
              </header>
              <div className="template-detail__grid">
                <div className="template-detail__description">
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
                          {selectedTemplate.ruleCount} {ruleCountLabel(selectedTemplate.ruleCount)}
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
                  <h3>Przebieg procesu</h3>
                  <ol>
                    {selectedTemplate.sectionTitles.slice(0, 4).map((section, index) => (
                      <li key={section}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <small>{section}</small>
                      </li>
                    ))}
                  </ol>
                  <Button
                    aria-controls="template-full-preview"
                    aria-expanded={fullPreviewOpen}
                    onClick={() => setFullPreviewOpen((current) => !current)}
                    size="small"
                    variant="secondary"
                  >
                    {fullPreviewOpen ? "Ukryj pełny podgląd" : "Pełny podgląd szablonu"}
                    <PanelIcon name={fullPreviewOpen ? "chevron-down" : "arrow-right"} />
                  </Button>
                </div>
              </div>
              {fullPreviewOpen ? (
                <div className="template-detail__questions" id="template-full-preview">
                  <header>
                    <h3>Pytania w szablonie</h3>
                    <p>Kolejność startowa — możesz ją później zmienić w builderze.</p>
                  </header>
                  <ol>
                    {selectedTemplate.stepTitles.map((title, index) => (
                      <li key={`${index}-${title}`}>
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

function templateCountLabel(count: number): string {
  if (count === 1) return "szablon";
  const lastTwo = count % 100;
  const last = count % 10;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return "szablony";
  return "szablonów";
}

function ruleCountLabel(count: number): string {
  if (count === 1) return "regułę przejścia";
  const lastTwo = count % 100;
  const last = count % 10;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return "reguły przejścia";
  return "reguł przejścia";
}
