import type { RenderedEmail } from "./templates";

export type EmailDeliveryRequest = Readonly<{
  from: string;
  idempotencyKey: string;
  message: RenderedEmail;
  notificationId: string;
  to: string;
}>;

export type EmailDeliveryResult =
  | Readonly<{ messageId: string; outcome: "sent" }>
  | Readonly<{ errorCode: DeliveryErrorCode; outcome: "failed"; retryable: boolean }>;

export type DeliveryErrorCode =
  | "configuration"
  | "network"
  | "provider_4xx"
  | "provider_429"
  | "provider_5xx"
  | "provider_invalid_response";

export interface EmailDeliveryAdapter {
  readonly name: "resend" | "test";
  deliver(request: EmailDeliveryRequest): Promise<EmailDeliveryResult>;
}

export class TestEmailDeliveryAdapter implements EmailDeliveryAdapter {
  readonly name = "test" as const;

  async deliver(request: EmailDeliveryRequest): Promise<EmailDeliveryResult> {
    return {
      messageId: `test_${request.notificationId}`,
      outcome: "sent",
    };
  }
}

export class ResendEmailDeliveryAdapter implements EmailDeliveryAdapter {
  readonly name = "resend" as const;
  readonly #apiKey: string;
  readonly #fetch: typeof fetch;

  constructor(input: Readonly<{ apiKey: string; fetch?: typeof fetch }>) {
    this.#apiKey = input.apiKey;
    this.#fetch = input.fetch ?? fetch;
  }

  async deliver(request: EmailDeliveryRequest): Promise<EmailDeliveryResult> {
    let response: Response;
    try {
      response = await this.#fetch("https://api.resend.com/emails", {
        body: JSON.stringify({
          from: request.from,
          html: request.message.html,
          subject: request.message.subject,
          text: request.message.text,
          to: [request.to],
        }),
        headers: {
          Authorization: `Bearer ${this.#apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": request.idempotencyKey,
        },
        method: "POST",
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      return { errorCode: "network", outcome: "failed", retryable: true };
    }
    if (!response.ok) {
      if (response.status === 429) {
        return { errorCode: "provider_429", outcome: "failed", retryable: true };
      }
      if (response.status >= 500) {
        return { errorCode: "provider_5xx", outcome: "failed", retryable: true };
      }
      return { errorCode: "provider_4xx", outcome: "failed", retryable: false };
    }
    const body: unknown = await response.json().catch(() => null);
    if (
      !body ||
      typeof body !== "object" ||
      !("id" in body) ||
      typeof body.id !== "string" ||
      body.id.length < 1 ||
      body.id.length > 256
    ) {
      return {
        errorCode: "provider_invalid_response",
        outcome: "failed",
        retryable: true,
      };
    }
    return { messageId: body.id, outcome: "sent" };
  }
}
