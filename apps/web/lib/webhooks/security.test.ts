import { describe, expect, it } from "vitest";

import {
  isPublicWebhookAddress,
  normalizeWebhookUrl,
  resolveWebhookTarget,
  WebhookTargetError,
} from "./security";

describe("webhook SSRF protection", () => {
  it("accepts only exact HTTPS URLs on port 443 without credentials or query data", () => {
    expect(normalizeWebhookUrl("https://hooks.partner.pl/kwotum/leads")).toBe(
      "https://hooks.partner.pl/kwotum/leads",
    );
    expect(normalizeWebhookUrl("https://hooks.partner.pl:443/kwotum")).toBe(
      "https://hooks.partner.pl/kwotum",
    );
    for (const url of [
      "http://hooks.partner.pl/kwotum",
      "https://user:pass@hooks.partner.pl/kwotum",
      "https://hooks.partner.pl:8443/kwotum",
      "https://hooks.partner.pl/kwotum?token=secret",
      "https://hooks.partner.pl/kwotum#fragment",
      "https://127.0.0.1/kwotum",
      "https://metadata.google.internal/computeMetadata/v1",
      "https://receiver.test/kwotum",
    ]) {
      expect(() => normalizeWebhookUrl(url), url).toThrow(WebhookTargetError);
    }
  });

  it("blocks private, loopback, metadata, documentation and transition addresses", () => {
    for (const address of [
      "0.0.0.0",
      "10.0.0.1",
      "100.64.0.1",
      "127.0.0.1",
      "169.254.169.254",
      "172.20.1.1",
      "192.168.1.1",
      "198.18.0.1",
      "203.0.113.4",
      "::",
      "::1",
      "::ffff:127.0.0.1",
      "64:ff9b::7f00:1",
      "2001:db8::1",
      "2002:7f00:1::",
      "fc00::1",
      "fe80::1",
      "ff02::1",
    ]) {
      expect(isPublicWebhookAddress(address), address).toBe(false);
    }
    expect(isPublicWebhookAddress("8.8.8.8")).toBe(true);
    expect(isPublicWebhookAddress("2606:4700:4700::1111")).toBe(true);
  });

  it("rejects a hostname if any DNS answer is unsafe and pins a safe answer", async () => {
    await expect(
      resolveWebhookTarget("https://hooks.partner.pl/kwotum", async () => [
        { address: "8.8.8.8", family: 4 },
        { address: "127.0.0.1", family: 4 },
      ]),
    ).rejects.toMatchObject({ code: "unsafe_target" });

    await expect(
      resolveWebhookTarget("https://hooks.partner.pl/kwotum", async () => []),
    ).rejects.toMatchObject({ code: "dns_resolution" });

    await expect(
      resolveWebhookTarget("https://hooks.partner.pl/kwotum", async () => [
        { address: "2606:4700:4700::1111", family: 6 },
        { address: "8.8.8.8", family: 4 },
      ]),
    ).resolves.toMatchObject({ address: "8.8.8.8", family: 4 });
  });

  it("bounds DNS resolution time", async () => {
    await expect(
      resolveWebhookTarget(
        "https://hooks.partner.pl/kwotum",
        () => new Promise(() => undefined),
        5,
      ),
    ).rejects.toMatchObject({ code: "dns_resolution" });
  });
});
