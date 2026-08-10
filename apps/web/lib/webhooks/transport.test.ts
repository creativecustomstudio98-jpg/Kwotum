import { describe, expect, it } from "vitest";

import { classifyWebhookResponse } from "./transport";

describe("webhook transport response policy", () => {
  it("accepts only 2xx and never follows redirects", () => {
    expect(classifyWebhookResponse(204)).toEqual({ outcome: "delivered", responseStatus: 204 });
    expect(classifyWebhookResponse(302)).toEqual({
      errorCode: "redirect",
      outcome: "failed",
      responseStatus: 302,
      retryable: false,
    });
  });

  it("retries transient HTTP failures and dead-letters permanent 4xx", () => {
    for (const [status, code] of [
      [408, "http_408"],
      [425, "http_425"],
      [429, "http_429"],
      [503, "http_5xx"],
    ] as const) {
      expect(classifyWebhookResponse(status)).toMatchObject({
        errorCode: code,
        outcome: "failed",
        retryable: true,
      });
    }
    expect(classifyWebhookResponse(401)).toMatchObject({
      errorCode: "http_4xx",
      outcome: "failed",
      retryable: false,
    });
  });
});
