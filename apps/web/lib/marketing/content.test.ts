import { describe, expect, it } from "vitest";

import { features, indexedRoutes, industries } from "./content";

describe("marketing content", () => {
  it("defines five unique, substantive industry and feature pages", () => {
    expect(industries).toHaveLength(5);
    expect(features).toHaveLength(5);
    expect(new Set(industries.map(({ slug }) => slug)).size).toBe(5);
    expect(new Set(features.map(({ slug }) => slug)).size).toBe(5);

    for (const industry of industries) {
      expect(industry.questions.length).toBeGreaterThanOrEqual(5);
      expect(industry.sampleBrief.length).toBeGreaterThanOrEqual(3);
      expect(industry.faq.length).toBeGreaterThanOrEqual(3);
      expect(industry.description.length).toBeGreaterThan(80);
    }
  });

  it("keeps the sitemap allowlist unique and excludes private surfaces", () => {
    expect(new Set(indexedRoutes).size).toBe(indexedRoutes.length);
    expect(indexedRoutes).not.toContain("/panel");
    expect(indexedRoutes).not.toContain("/logowanie");
    expect(indexedRoutes).not.toContain("/design-system");
  });
});
