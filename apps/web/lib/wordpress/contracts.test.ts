import { describe, expect, it } from "vitest";

import {
  wordpressConnectRequestSchema,
  wordpressFlowsResponseSchema,
  wordpressSiteOriginSchema,
} from "./contracts";
import { connectorCredential } from "./http";

describe("WordPress connector contracts", () => {
  it("normalizes a pinned HTTPS origin and rejects paths or insecure origins", () => {
    expect(wordpressSiteOriginSchema.parse("https://Firma.PL/")).toBe("https://firma.pl");
    expect(wordpressSiteOriginSchema.safeParse("http://firma.pl").success).toBe(false);
    expect(wordpressSiteOriginSchema.safeParse("https://firma.pl/wp-admin").success).toBe(false);
    expect(wordpressSiteOriginSchema.safeParse("https://user@firma.pl").success).toBe(false);
  });

  it("accepts only bounded versions and 256-bit lowercase tokens", () => {
    const base = {
      installToken: "a".repeat(64),
      phpVersion: "8.5.2",
      pluginVersion: "1.0.0",
      siteOrigin: "https://firma.pl",
      wordpressVersion: "7.0.2",
    };
    expect(wordpressConnectRequestSchema.safeParse(base).success).toBe(true);
    expect(
      wordpressConnectRequestSchema.safeParse({ ...base, installToken: "A".repeat(64) }).success,
    ).toBe(false);
    expect(
      wordpressConnectRequestSchema.safeParse({ ...base, pluginVersion: "latest" }).success,
    ).toBe(false);
  });

  it("never accepts a credential in a URL or malformed authorization scheme", () => {
    const credential = "b".repeat(64);
    expect(
      connectorCredential(
        new Request(`https://api.test/flows?credential=${credential}`, {
          headers: { Authorization: `Basic ${credential}` },
        }),
      ),
    ).toBeNull();
    expect(
      connectorCredential(
        new Request("https://api.test/flows", {
          headers: { Authorization: `Bearer ${credential}` },
        }),
      ),
    ).toBe(credential);
  });

  it("exposes only allowlisted public flow fields", () => {
    const parsed = wordpressFlowsResponseSchema.parse({
      flows: [
        {
          credential: "secret",
          name: "Wycena",
          publicId: "123e4567-e89b-42d3-a456-426614174000",
          version: 1,
        },
      ],
    });
    expect(parsed).toEqual({
      flows: [
        {
          name: "Wycena",
          publicId: "123e4567-e89b-42d3-a456-426614174000",
          version: 1,
        },
      ],
    });
    expect(
      wordpressFlowsResponseSchema.safeParse({
        flows: [
          {
            name: "Wycena",
            publicId: "not-a-uuid",
            version: 1,
          },
        ],
      }).success,
    ).toBe(false);
  });
});
