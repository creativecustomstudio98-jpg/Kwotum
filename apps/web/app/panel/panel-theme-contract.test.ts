import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const sharedTheme = readFileSync(
  new URL("../../../../packages/ui/src/styles.css", import.meta.url),
  "utf8",
);
const panelStyles = [
  readFileSync(new URL("./styles.css", import.meta.url), "utf8"),
  readFileSync(new URL("./reference-fidelity.css", import.meta.url), "utf8"),
].join("\n");
const panelBaseStyles = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
const panelReferenceStyles = readFileSync(
  new URL("./reference-fidelity.css", import.meta.url),
  "utf8",
);
const panelThemeRule = sharedTheme.match(/\.wy-panel-theme\s*\{([^}]*)\}/)?.[1];

function rules(source: string, selector: string): string[] {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...source.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, "g"))].map(
    (match) => match[1] ?? "",
  );
}

if (!panelThemeRule) {
  throw new Error("Brak reguły .wy-panel-theme w pakiecie UI.");
}

describe("kontrakt wizualny panelu M1", () => {
  it("aktywuje lokalny Instrument Sans tylko w motywie panelu", () => {
    expect(panelThemeRule).toMatch(/--wy-font-sans:[\s\S]*?--wy-font-instrument-sans/);
    expect(panelThemeRule).toMatch(/font-family:\s*var\(--wy-font-sans\)/);
  });

  it("utrzymuje jasny neutralny shell oraz geometrię 256/72", () => {
    expect(panelThemeRule).toContain("--wy-color-background: #ffffff");
    expect(panelThemeRule).toContain("--kw-sidebar-bg: #fafaf9");
    expect(panelThemeRule).toContain("--kw-sidebar-width-expanded: 256px");
    expect(panelThemeRule).toContain("--kw-sidebar-width-collapsed: 72px");
  });

  it("nie dopuszcza wag spoza 400/500/600/700 w arkuszach panelu", () => {
    const numericWeights = [...panelStyles.matchAll(/font-weight:\s*(\d+)\s*;/g)].map((match) =>
      Number(match[1]),
    );

    expect(numericWeights.length).toBeGreaterThan(0);
    expect(numericWeights.filter((weight) => ![400, 500, 600, 700].includes(weight))).toEqual([]);
  });

  it("utrzymuje bialy canvas i nawigacje o szerokosci tresci", () => {
    expect(rules(panelBaseStyles, ".panel-page-header__navigation")).not.toEqual(
      expect.arrayContaining([expect.stringContaining("border-bottom")]),
    );
    expect(rules(panelBaseStyles, ".panel-module-navigation__track")).toEqual(
      expect.arrayContaining([expect.stringContaining("min-width: max-content")]),
    );
    expect(
      rules(
        panelReferenceStyles,
        ".lead-list-surface > .lead-filters.record-tabs.lead-filters--segmented",
      ),
    ).toEqual(expect.arrayContaining([expect.stringContaining("width: fit-content")]));
    expect(rules(panelReferenceStyles, ".help-center-panel")).toEqual(
      expect.arrayContaining([expect.stringContaining("background: var(--wy-color-surface)")]),
    );
    expect(rules(panelReferenceStyles, ".help-center")).toEqual(
      expect.arrayContaining([expect.stringContaining("border: 0")]),
    );
  });

  it("utrzymuje referencyjny segmented control i lokalne ramy integracji", () => {
    expect(
      rules(panelBaseStyles, ".panel-module-navigation--segmented .panel-module-navigation__track"),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("border-radius: var(--wy-radius-pill)"),
        expect.stringContaining("background: var(--wy-color-surface-muted)"),
      ]),
    );
    expect(rules(panelReferenceStyles, ".integrations-primary-grid")).toEqual(
      expect.arrayContaining([
        expect.stringContaining("border: 1px solid var(--wy-color-border)"),
        expect.stringContaining("border-radius: 12px"),
      ]),
    );
    expect(rules(panelReferenceStyles, ".integration-connections")).toEqual(
      expect.arrayContaining([
        expect.stringContaining("border: 1px solid var(--wy-color-border)"),
        expect.stringContaining("border-radius: 12px"),
      ]),
    );
    expect(rules(panelReferenceStyles, ".integration-url-input")).toEqual(
      expect.arrayContaining([
        expect.stringContaining("height: 44px"),
        expect.stringContaining("min-height: 44px"),
      ]),
    );
  });
});
