import { describe, expect, it } from "vitest";

import {
  createOrganizationSlug,
  validateRecoveryEmail,
  validateRegistration,
  validateSignIn,
} from "./forms";

function formData(values: Readonly<Record<string, string>>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("auth form validation", () => {
  it("does not reveal account state and rejects malformed sign-in values", () => {
    const result = validateSignIn(
      formData({
        email: "niepoprawny-adres",
        password: "krótko",
      }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toBe("Podaj poprawny adres e-mail.");
      expect(result.errors.password).toBe("Hasło musi mieć co najmniej 8 znaków.");
    }
  });

  it("requires matching strong passwords and legal consent during registration", () => {
    const mismatchResult = validateRegistration(
      formData({
        companyName: "Kwotum Studio",
        confirmPassword: "InneHaslo8",
        email: "anna@example.com",
        fullName: "Anna Kowalska",
        password: "Bezpieczne7",
        terms: "on",
      }),
    );

    expect(mismatchResult.success).toBe(false);
    if (!mismatchResult.success) {
      expect(mismatchResult.errors.confirmPassword).toBe("Hasła muszą być identyczne.");
    }

    const consentResult = validateRegistration(
      formData({
        companyName: "Kwotum Studio",
        confirmPassword: "Bezpieczne7",
        email: "anna@example.com",
        fullName: "Anna Kowalska",
        password: "Bezpieczne7",
      }),
    );

    expect(consentResult.success).toBe(false);
    if (!consentResult.success) {
      expect(consentResult.errors.termsAccepted).toBe(
        "Zaakceptuj Regulamin i Politykę prywatności.",
      );
    }
  });

  it("returns the recovery e-mail under a named field", () => {
    const result = validateRecoveryEmail(
      formData({
        email: "  ANNA@EXAMPLE.COM ",
      }),
    );

    expect(result).toEqual({
      data: { email: "anna@example.com" },
      success: true,
    });
  });

  it("creates a stable URL-safe organization slug", () => {
    expect(createOrganizationSlug("Łódź & Synowie", "ABCDEF12-rest")).toBe("lodz-synowie-abcdef12");
  });
});
