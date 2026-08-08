import { describe, expect, it } from "vitest";

import { isDesignSystemAvailable } from "./availability";

describe("design system availability", () => {
  it.each(["local", "preview"])("keeps the showcase available in %s", (deploymentEnv) => {
    expect(isDesignSystemAvailable({ deploymentEnv })).toBe(true);
  });

  it.each(["staging", "production", "invalid"])("hides the showcase in %s", (deploymentEnv) => {
    expect(isDesignSystemAvailable({ deploymentEnv })).toBe(false);
  });

  it("treats a Vercel production runtime as production", () => {
    expect(isDesignSystemAvailable({ vercelEnv: "production" })).toBe(false);
  });
});
