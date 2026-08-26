import { paginateCollection } from "../../pagination-model";
import { describe, expect, it } from "vitest";

import {
  filterTemplateLibrary,
  templateLibraryHref,
  type TemplateLibraryItem,
} from "./template-library-model";

function template(index: number): TemplateLibraryItem {
  return {
    description: `Opis unikat-${index}`,
    industry: `Branża ${index}`,
    name: `Szablon ${index}`,
    priority: index === 1,
    questionCount: index,
    requiredQuestionCount: Math.max(1, index - 1),
    ruleCount: index % 2,
    sectionTitles: ["Zakres"],
    slug: `szablon-${index}`,
    stepTitles: ["Pytanie"],
  };
}

describe("template library model", () => {
  const filters = {
    category: "all",
    complexity: "all" as const,
    query: "",
    sortOrder: "default" as const,
  };

  it("distinguishes 0, 1 and 100+ filtered template states", () => {
    const templates = Array.from({ length: 101 }, (_, index) => template(index + 1));

    expect(filterTemplateLibrary([], filters)).toEqual([]);
    expect(filterTemplateLibrary(templates, { ...filters, query: "unikat-100" })).toHaveLength(1);
    expect(filterTemplateLibrary(templates, { ...filters, query: "brak-wyniku" })).toHaveLength(0);
    const page = paginateCollection(filterTemplateLibrary(templates, filters), 13, 8);
    expect(page).toMatchObject({ page: 13, pageCount: 13, total: 101 });
    expect(page.items).toHaveLength(5);
  });

  it("serializes only durable non-default filters", () => {
    expect(
      templateLibraryHref("tenant-id", {
        category: "Ogrodzenia",
        complexity: "advanced",
        page: 3,
        query: "  brama  ",
        sortOrder: "questions",
      }),
    ).toBe(
      "/panel/tenant-id/szablony?q=brama&category=Ogrodzenia&complexity=advanced&sort=questions&page=3",
    );
  });
});
