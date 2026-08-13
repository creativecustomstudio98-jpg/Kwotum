import { describe, expect, it } from "vitest";

import {
  formatLastActivity,
  latestIsoDate,
  normalizeOrganizationSearch,
  organizationMatchesSearch,
  organizationRolePresentation,
  organizationStatusPresentation,
} from "./organization-picker-model";

describe("organization picker model", () => {
  it("wybiera najnowszą poprawną datę", () => {
    expect(
      latestIsoDate([
        "2026-08-01T10:00:00.000Z",
        null,
        "niepoprawna-data",
        "2026-08-03T08:00:00.000Z",
      ]),
    ).toBe("2026-08-03T08:00:00.000Z");
    expect(latestIsoDate([null, undefined])).toBeNull();
  });

  it("opisuje ostatnią aktywność z dokładną godziną względem czasu warszawskiego", () => {
    const now = new Date("2026-08-13T16:00:00.000Z");
    expect(formatLastActivity("2026-08-13T07:42:00.000Z", now)).toBe("Dzisiaj, 09:42");
    expect(formatLastActivity("2026-08-12T12:18:00.000Z", now)).toBe("Wczoraj, 14:18");
    expect(formatLastActivity("2026-08-11T14:03:00.000Z", now)).toBe("2 dni temu, 16:03");
    expect(formatLastActivity("2026-08-01T08:11:00.000Z", now)).toBe("12 dni temu, 10:11");
    expect(formatLastActivity("2026-06-30T08:11:00.000Z", now)).toBe("30 cze, 10:11");
    expect(formatLastActivity(null, now)).toBe("Brak aktywności");
  });

  it("prezentuje wyłącznie istniejące role i statusy członkostwa", () => {
    expect(organizationRolePresentation("owner")).toEqual({
      description: "Pełny dostęp",
      label: "Właściciel",
    });
    expect(organizationRolePresentation("admin")).toEqual({
      description: "Pełny dostęp",
      label: "Administrator",
    });
    expect(organizationRolePresentation("sales")).toEqual({
      description: "Obsługa leadów",
      label: "Sprzedaż",
    });
    expect(organizationStatusPresentation("active")).toEqual({
      label: "Aktywna",
      tone: "active",
    });
  });

  it("normalizuje i ogranicza wyszukiwanie po nazwie albo slugu", () => {
    expect(normalizeOrganizationSearch("  Fortez   Przyczepy  ")).toBe("Fortez Przyczepy");
    expect(normalizeOrganizationSearch("x".repeat(160))).toHaveLength(120);
    expect(
      organizationMatchesSearch({ name: "Fortez Przyczepy", slug: "fortez" }, "PRZYCZEPY"),
    ).toBe(true);
    expect(organizationMatchesSearch({ name: "Fortez Przyczepy", slug: "fortez" }, "fort")).toBe(
      true,
    );
    expect(organizationMatchesSearch({ name: "Fortez Przyczepy", slug: "fortez" }, "kwotum")).toBe(
      false,
    );
  });
});
