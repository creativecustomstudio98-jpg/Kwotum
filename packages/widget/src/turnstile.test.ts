// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

import { requestTurnstileToken } from "./turnstile.js";

const challenge = {
  action: "kwotum_lead_submit" as const,
  appearance: "interaction-only" as const,
  provider: "turnstile" as const,
  siteKey: "1x00000000000000000000AA",
};

afterEach(() => {
  vi.unstubAllGlobals();
  delete window.turnstile;
  document.body.replaceChildren();
});

describe("Turnstile widget client", () => {
  it("uses explicit adaptive execution and resolves a single-use token", async () => {
    let configured:
      | Readonly<{
          action: string;
          appearance: string;
          callback(token: string): void;
          execution: string;
          "response-field": boolean;
          sitekey: string;
        }>
      | undefined;
    const turnstile = {
      execute: vi.fn(),
      remove: vi.fn(),
      render: vi.fn((_: HTMLElement, options: NonNullable<typeof configured>) => {
        configured = options;
        queueMicrotask(() => options.callback("fresh-single-use-token"));
        return "widget-1";
      }),
    };
    Object.defineProperty(window, "turnstile", { configurable: true, value: turnstile });
    const target = document.createElement("div");
    document.body.append(target);

    await expect(requestTurnstileToken(target, challenge)).resolves.toBe("fresh-single-use-token");
    expect(configured).toMatchObject({
      action: "kwotum_lead_submit",
      appearance: "interaction-only",
      execution: "execute",
      "response-field": false,
      sitekey: challenge.siteKey,
    });
    expect(turnstile.execute).toHaveBeenCalledWith("widget-1");
    await Promise.resolve();
    expect(turnstile.remove).toHaveBeenCalledWith("widget-1");
  });

  it.each([
    ["error-callback", "FAILED"],
    ["expired-callback", "EXPIRED"],
    ["timeout-callback", "TIMEOUT"],
    ["unsupported-callback", "UNSUPPORTED"],
  ] as const)("maps %s to a safe %s error and removes the widget", async (callback, code) => {
    type TurnstileOptions = Parameters<NonNullable<Window["turnstile"]>["render"]>[1];
    const turnstile = {
      execute: vi.fn(),
      remove: vi.fn(),
      render: vi.fn((_: HTMLElement, options: TurnstileOptions) => {
        queueMicrotask(() => options[callback]());
        return "widget-failure";
      }),
    };
    Object.defineProperty(window, "turnstile", { configurable: true, value: turnstile });
    const target = document.createElement("div");
    document.body.append(target);

    await expect(requestTurnstileToken(target, challenge)).rejects.toMatchObject({
      code,
      name: "WidgetChallengeError",
    });
    await Promise.resolve();

    expect(turnstile.execute).toHaveBeenCalledWith("widget-failure");
    expect(turnstile.remove).toHaveBeenCalledWith("widget-failure");
  });
});
