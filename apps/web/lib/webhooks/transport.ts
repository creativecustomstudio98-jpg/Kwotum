import { request as httpsRequest } from "node:https";
import type { LookupFunction } from "node:net";

import type { WebhookErrorCode } from "@wyceno/database";

import type { WebhookNetworkTarget } from "./security";

export type WebhookHttpResult = Readonly<{
  responseStatus: number;
}>;

export type ClassifiedWebhookResponse = Readonly<
  | { outcome: "delivered"; responseStatus: number }
  | {
      errorCode: WebhookErrorCode;
      outcome: "failed";
      responseStatus: number;
      retryable: boolean;
    }
>;

export class WebhookTransportError extends Error {
  readonly code: "network" | "timeout" | "tls";

  constructor(code: "network" | "timeout" | "tls", message: string) {
    super(message);
    this.code = code;
    this.name = "WebhookTransportError";
  }
}

export function classifyWebhookResponse(responseStatus: number): ClassifiedWebhookResponse {
  if (responseStatus >= 200 && responseStatus <= 299) {
    return { outcome: "delivered", responseStatus };
  }
  if (responseStatus >= 300 && responseStatus <= 399) {
    return { errorCode: "redirect", outcome: "failed", responseStatus, retryable: false };
  }
  if (responseStatus === 408) {
    return { errorCode: "http_408", outcome: "failed", responseStatus, retryable: true };
  }
  if (responseStatus === 425) {
    return { errorCode: "http_425", outcome: "failed", responseStatus, retryable: true };
  }
  if (responseStatus === 429) {
    return { errorCode: "http_429", outcome: "failed", responseStatus, retryable: true };
  }
  if (responseStatus >= 400 && responseStatus <= 499) {
    return { errorCode: "http_4xx", outcome: "failed", responseStatus, retryable: false };
  }
  if (responseStatus >= 500 && responseStatus <= 599) {
    return { errorCode: "http_5xx", outcome: "failed", responseStatus, retryable: true };
  }
  return { errorCode: "invalid_response", outcome: "failed", responseStatus, retryable: false };
}

function transportError(error: unknown): WebhookTransportError {
  if (error instanceof WebhookTransportError) return error;
  const code =
    typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  if (
    code.startsWith("ERR_TLS") ||
    code.startsWith("ERR_SSL") ||
    code.startsWith("CERT_") ||
    code.includes("CERT") ||
    code === "DEPTH_ZERO_SELF_SIGNED_CERT" ||
    code === "SELF_SIGNED_CERT_IN_CHAIN" ||
    code === "UNABLE_TO_GET_ISSUER_CERT" ||
    code === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY" ||
    code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE"
  ) {
    return new WebhookTransportError("tls", "Webhook TLS validation failed.");
  }
  return new WebhookTransportError("network", "Webhook network request failed.");
}

export async function sendPinnedWebhookRequest(
  input: Readonly<{
    body: string;
    headers: Readonly<Record<string, string>>;
    target: WebhookNetworkTarget;
    timeoutMs?: number;
  }>,
): Promise<WebhookHttpResult> {
  const timeoutMs = input.timeoutMs ?? 5_000;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 500 || timeoutMs > 15_000) {
    throw new Error("Webhook timeout is invalid.");
  }

  const pinnedLookup: LookupFunction = (_hostname, options, callback) => {
    if (typeof options === "object" && options.all) {
      callback(null, [{ address: input.target.address, family: input.target.family }]);
      return;
    }
    callback(null, input.target.address, input.target.family);
  };

  return new Promise<WebhookHttpResult>((resolve, reject) => {
    let settled = false;
    const finish = (
      result: Readonly<{ error: WebhookTransportError }> | Readonly<{ responseStatus: number }>,
    ) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      if ("error" in result) reject(result.error);
      else resolve({ responseStatus: result.responseStatus });
    };
    const request = httpsRequest(
      input.target.url,
      {
        agent: false,
        headers: {
          ...input.headers,
          "Content-Length": String(Buffer.byteLength(input.body, "utf8")),
          "Content-Type": "application/json; charset=utf-8",
          "User-Agent": "Kwotum-Webhook/1.0",
        },
        lookup: pinnedLookup,
        method: "POST",
        servername: input.target.url.hostname,
      },
      (response) => {
        const status = response.statusCode;
        if (status === undefined) {
          finish({
            error: new WebhookTransportError("network", "Webhook response has no status."),
          });
        } else {
          finish({ responseStatus: status });
        }
        response.destroy();
      },
    );
    const deadline = setTimeout(() => {
      request.destroy(new WebhookTransportError("timeout", "Webhook request timed out."));
    }, timeoutMs);
    deadline.unref();
    request.setTimeout(timeoutMs, () => {
      request.destroy(new WebhookTransportError("timeout", "Webhook request timed out."));
    });
    request.once("error", (error) => {
      finish({ error: transportError(error) });
    });
    request.end(input.body, "utf8");
  });
}
