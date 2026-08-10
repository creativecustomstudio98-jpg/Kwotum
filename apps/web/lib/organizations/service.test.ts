import { describe, expect, it } from "vitest";

import { organizationNameSchema } from "./service";

describe("organizationNameSchema", () => {
  it("normalizuje poprawną nazwę organizacji", () => {
    expect(organizationNameSchema.parse("  Studio Mebli  ")).toBe("Studio Mebli");
  });

  it("odrzuca pustą i zbyt długą nazwę", () => {
    expect(organizationNameSchema.safeParse(" ").success).toBe(false);
    expect(organizationNameSchema.safeParse("x".repeat(121)).success).toBe(false);
  });
});
