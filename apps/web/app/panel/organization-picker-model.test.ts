import { describe, expect, it } from "vitest";

import {
  formatActiveProcessCount,
  formatAttentionLeadCount,
  formatLastActivity,
  latestIsoDate,
} from "./organization-picker-model";

describe("organization picker model", () => {
  it("odmienia procesy i leady po polsku", () => {
    expect(formatActiveProcessCount(1)).toBe("1 aktywny proces");
    expect(formatActiveProcessCount(2)).toBe("2 aktywne procesy");
    expect(formatActiveProcessCount(12)).toBe("12 aktywnych procesów");
    expect(formatAttentionLeadCount(1)).toBe("1 lead do obsługi");
    expect(formatAttentionLeadCount(3)).toBe("3 leady do obsługi");
    expect(formatAttentionLeadCount(14)).toBe("14 leadów do obsługi");
  });

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

  it("opisuje ostatnią aktywność względem czasu warszawskiego", () => {
    const now = new Date("2026-08-03T12:00:00.000Z");
    expect(formatLastActivity("2026-08-03T08:00:00.000Z", now)).toBe("Ostatnia aktywność dzisiaj");
    expect(formatLastActivity("2026-08-02T08:00:00.000Z", now)).toBe("Ostatnia aktywność wczoraj");
    expect(formatLastActivity("2026-07-30T08:00:00.000Z", now)).toBe("Ostatnia aktywność 30 lip");
    expect(formatLastActivity(null, now)).toBe("Brak aktywności");
  });
});
