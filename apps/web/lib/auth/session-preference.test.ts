import { describe, expect, it } from "vitest";

import { asSessionCookie } from "./session-preference";

describe("session cookie preference", () => {
  it("removes persistence attributes without mutating Supabase options", () => {
    const options = {
      expires: new Date("2030-01-01T00:00:00.000Z"),
      httpOnly: true,
      maxAge: 3600,
      path: "/",
      sameSite: "lax" as const,
      secure: true,
    };

    expect(asSessionCookie(options)).toEqual({
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
    expect(options).toHaveProperty("expires");
    expect(options).toHaveProperty("maxAge", 3600);
  });
});
