import { describe, expect, it } from "vitest";

import { getSafeLocalDestination } from "./safe-destination";

describe("safe local destination", () => {
  it.each(["https://attacker.test", "//attacker.test", "/\\attacker.test"])(
    "rejects external redirect form %s",
    (destination) => {
      expect(getSafeLocalDestination(destination)).toBe("/panel");
    },
  );

  it("keeps a local path including its query", () => {
    expect(getSafeLocalDestination("/panel?organization=example")).toBe(
      "/panel?organization=example",
    );
  });
});
