import { describe, expect, it } from "vitest";

import { maskEmail } from "./activity";

describe("maskEmail", () => {
  it("maskuje lokalną część adresu", () => {
    expect(maskEmail("anna@example.test")).toBe("an•••@example.test");
  });

  it("nie ujawnia braku lub błędnego odbiorcy", () => {
    expect(maskEmail(null)).toBe("Brak odbiorcy");
    expect(maskEmail("invalid")).toBe("Nieprawidłowy adres");
  });
});
