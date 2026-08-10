import { createHmac, timingSafeEqual } from "node:crypto";

const SECRET_PREFIX = "whsec_";
const SIGNATURE_PREFIX = "v1=";

function requireSigningSecret(secret: string): void {
  if (secret.length < 32) throw new Error("Webhook signing secret is not configured.");
}

export function deriveWebhookEndpointSecret(
  input: Readonly<{
    endpointId: string;
    masterSecret: string;
    organizationId: string;
    secretVersion: number;
  }>,
): string {
  requireSigningSecret(input.masterSecret);
  if (!Number.isInteger(input.secretVersion) || input.secretVersion < 1) {
    throw new Error("Webhook secret version is invalid.");
  }
  const context = [
    "kwotum-webhook-v1",
    input.organizationId,
    input.endpointId,
    String(input.secretVersion),
  ].join(":");
  return `${SECRET_PREFIX}${createHmac("sha256", input.masterSecret)
    .update(context, "utf8")
    .digest("base64url")}`;
}

export function signWebhookBody(
  input: Readonly<{
    rawBody: string;
    secret: string;
    timestamp: number;
  }>,
): string {
  requireSigningSecret(input.secret);
  if (!Number.isSafeInteger(input.timestamp) || input.timestamp <= 0) {
    throw new Error("Webhook timestamp is invalid.");
  }
  const digest = createHmac("sha256", input.secret)
    .update(`${input.timestamp}.${input.rawBody}`, "utf8")
    .digest("hex");
  return `${SIGNATURE_PREFIX}${digest}`;
}

export function verifyWebhookSignature(
  input: Readonly<{
    now: number;
    rawBody: string;
    replayWindowSeconds?: number;
    secret: string;
    signature: string;
    timestamp: number;
  }>,
): boolean {
  const replayWindow = input.replayWindowSeconds ?? 300;
  if (
    !Number.isSafeInteger(input.now) ||
    !Number.isSafeInteger(input.timestamp) ||
    Math.abs(input.now - input.timestamp) > replayWindow ||
    !input.signature.startsWith(SIGNATURE_PREFIX)
  ) {
    return false;
  }
  let expected: string;
  try {
    expected = signWebhookBody(input);
  } catch {
    return false;
  }
  const expectedBuffer = Buffer.from(expected, "utf8");
  const suppliedBuffer = Buffer.from(input.signature, "utf8");
  return (
    expectedBuffer.byteLength === suppliedBuffer.byteLength &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  );
}
