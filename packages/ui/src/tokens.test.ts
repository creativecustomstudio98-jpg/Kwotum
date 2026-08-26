import { describe, expect, it } from "vitest";

import { contrastRatio, relativeLuminance } from "./contrast";
import { colorTokens, marketingColorTokens, panelColorTokens, panelSidebarTokens } from "./tokens";

describe("tokeny kolorystyczne", () => {
  it.each([
    ["tekst główny / powierzchnia", colorTokens.textPrimary, colorTokens.surface],
    ["tekst główny / tło", colorTokens.textPrimary, colorTokens.background],
    ["tekst drugorzędny / powierzchnia", colorTokens.textSecondary, colorTokens.surface],
    ["tekst wyciszony / powierzchnia", colorTokens.textMuted, colorTokens.surface],
    ["tekst wyciszony / powierzchnia drugorzędna", colorTokens.textMuted, colorTokens.surfaceMuted],
    ["biały / marka", colorTokens.surface, colorTokens.brand],
    ["tekst marki / miękka marka", colorTokens.brand, colorTokens.brandSoft],
    ["sukces / powierzchnia", colorTokens.success, colorTokens.surface],
    ["sukces / miękki sukces", colorTokens.success, colorTokens.successSoft],
    ["błąd / powierzchnia", colorTokens.danger, colorTokens.surface],
    ["ostrzeżenie / powierzchnia", colorTokens.warning, colorTokens.surface],
    ["informacja / powierzchnia", colorTokens.info, colorTokens.surface],
  ])("%s spełnia WCAG AA dla zwykłego tekstu", (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });

  it("mocna linia spełnia kontrast 3:1 dla granic kontrolek", () => {
    expect(contrastRatio(colorTokens.borderStrong, colorTokens.surface)).toBeGreaterThanOrEqual(3);
  });

  it("utrzymuje aliasy zgodności bez tworzenia drugiej palety", () => {
    expect(colorTokens.text).toBe(colorTokens.textPrimary);
    expect(colorTokens.accent).toBe(colorTokens.brandSoft);
    expect(colorTokens.accentStrong).toBe(colorTokens.brand);
    expect(colorTokens.error).toBe(colorTokens.danger);
  });

  it("odrzuca nieprawidłowy zapis koloru", () => {
    expect(() => relativeLuminance("#fff")).toThrow("Nieprawidłowy kolor szesnastkowy");
  });

  it.each([
    ["tekst / tło marketingowe", marketingColorTokens.textPrimary, marketingColorTokens.background],
    [
      "tekst / powierzchnia marketingowa",
      marketingColorTokens.textPrimary,
      marketingColorTokens.surface,
    ],
    [
      "tekst drugorzędny / powierzchnia",
      marketingColorTokens.textSecondary,
      marketingColorTokens.surface,
    ],
    ["biały / CTA marketingowe", marketingColorTokens.surface, marketingColorTokens.brand],
    ["zieleń / miękka powierzchnia", marketingColorTokens.brand, marketingColorTokens.brandSoft],
  ])("%s spełnia WCAG AA", (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ["tekst panelu / powierzchnia", panelColorTokens.textPrimary, panelColorTokens.surface],
    [
      "tekst drugorzędny panelu / powierzchnia",
      panelColorTokens.textSecondary,
      panelColorTokens.surface,
    ],
    ["tekst sidebara / sidebar", panelSidebarTokens.text, panelSidebarTokens.background],
    [
      "tekst wyciszony sidebara / sidebar",
      panelSidebarTokens.textMuted,
      panelSidebarTokens.background,
    ],
    ["label sidebara / sidebar", panelSidebarTokens.label, panelSidebarTokens.background],
    ["label sidebara / hover", panelSidebarTokens.label, panelSidebarTokens.hover],
    ["tekst subtelny sidebara / hover", panelSidebarTokens.textSubtle, panelSidebarTokens.hover],
    ["focus panelu / powierzchnia", panelColorTokens.focus, panelColorTokens.surface],
  ])("%s spełnia WCAG AA", (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });

  it("utrzymuje wspólny neutralny kontrakt panelu i sidebara", () => {
    expect(panelSidebarTokens.background).toBe(panelColorTokens.surfaceMuted);
    expect(panelSidebarTokens.text).toBe(panelColorTokens.textPrimary);
    expect(panelSidebarTokens.textMuted).toBe(panelColorTokens.textSecondary);
    expect(panelSidebarTokens.line).toBe(panelColorTokens.border);
    expect(panelSidebarTokens.focus).toBe(panelColorTokens.focus);
    expect(panelSidebarTokens.widthExpanded).toBe("256px");
    expect(panelSidebarTokens.widthCollapsed).toBe("72px");
  });

  it("utrzymuje kontrast 3:1 mocnej granicy kontrolek panelu", () => {
    expect(
      contrastRatio(panelColorTokens.borderStrong, panelColorTokens.surface),
    ).toBeGreaterThanOrEqual(3);
  });
});
