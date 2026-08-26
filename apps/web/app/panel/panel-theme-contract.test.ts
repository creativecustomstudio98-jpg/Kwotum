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
const panelThemeRule = sharedTheme.match(/\.wy-panel-theme\s*\{([^}]*)\}/)?.[1];

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
});
