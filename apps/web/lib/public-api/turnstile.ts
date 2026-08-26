import type { WidgetManifestContract } from "@wyceno/validation";
import { z } from "zod";

export const TURNSTILE_ACTION = "kwotum_lead_submit" as const;

const TURNSTILE_SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_TIMEOUT_MS = 4_000;
const TURNSTILE_MAX_AGE_MS = 5 * 60 * 1_000;
const TURNSTILE_CLOCK_SKEW_MS = 60 * 1_000;

const turnstileResponseSchema = z
  .object({
    action: z.string().max(32).optional(),
    challenge_ts: z.iso.datetime({ offset: true }).optional(),
    "error-codes": z.array(z.string().max(80)).max(20).optional(),
    hostname: z.string().max(253).optional(),
    success: z.boolean(),
  })
  .passthrough();

type TurnstileConfiguration =
  | Readonly<{ mode: "disabled" }>
  | Readonly<{ mode: "misconfigured" }>
  | Readonly<{ mode: "enabled"; secretKey: string; siteKey: string }>;

export type TurnstileVerification =
  | Readonly<{ status: "rejected"; reason: "action" | "expired" | "hostname" | "token" }>
  | Readonly<{ status: "unavailable" }>
  | Readonly<{ status: "verified" }>;

function deploymentEnvironment(): "local" | "preview" | "production" | "staging" {
  const configured = process.env.DEPLOYMENT_ENV;
  if (
    configured === "local" ||
    configured === "preview" ||
    configured === "production" ||
    configured === "staging"
  ) {
    return configured;
  }
  if (process.env.VERCEL_ENV === "production") return "production";
  if (process.env.VERCEL_ENV === "preview") return "preview";
  return "local";
}

function configuration(): TurnstileConfiguration {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!siteKey && !secretKey) {
    return deploymentEnvironment() === "local" ? { mode: "disabled" } : { mode: "misconfigured" };
  }
  if (
    !siteKey ||
    !secretKey ||
    siteKey !== siteKey.trim() ||
    secretKey !== secretKey.trim() ||
    !/^[A-Za-z0-9_-]{3,32}$/.test(siteKey) ||
    secretKey.length > 2048
  ) {
    return { mode: "misconfigured" };
  }
  return { mode: "enabled", secretKey, siteKey };
}

export function manifestWithRuntimeChallenge(
  manifest: WidgetManifestContract,
): Readonly<{ manifest: WidgetManifestContract; ready: true }> | Readonly<{ ready: false }> {
  const configured = configuration();
  if (configured.mode === "misconfigured") return { ready: false };
  return {
    manifest: {
      ...manifest,
      challenge:
        configured.mode === "enabled"
          ? {
              action: TURNSTILE_ACTION,
              appearance: "interaction-only",
              provider: "turnstile",
              siteKey: configured.siteKey,
            }
          : null,
    },
    ready: true,
  };
}

function expectedHostname(corsOrigin: string | null): string | null {
  try {
    return new URL(corsOrigin ?? process.env.APP_URL ?? "http://localhost:3000").hostname;
  } catch {
    return null;
  }
}

async function siteverify(
  payload: URLSearchParams,
  fetchImplementation: typeof fetch,
): Promise<z.infer<typeof turnstileResponseSchema> | null> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TURNSTILE_TIMEOUT_MS);
    try {
      const response = await fetchImplementation(TURNSTILE_SITEVERIFY_URL, {
        body: payload,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        method: "POST",
        signal: controller.signal,
      });
      if (!response.ok) continue;
      const parsed = turnstileResponseSchema.safeParse(await response.json());
      if (parsed.success) return parsed.data;
    } catch {
      // One bounded retry uses the same provider idempotency key.
    } finally {
      clearTimeout(timeout);
    }
  }
  return null;
}

export async function verifyTurnstile(
  input: Readonly<{
    clientAddress: string;
    corsOrigin: string | null;
    idempotencyKey: string;
    token: string;
  }>,
  fetchImplementation: typeof fetch = fetch,
): Promise<TurnstileVerification> {
  const configured = configuration();
  if (configured.mode === "disabled") return { status: "verified" };
  if (configured.mode === "misconfigured") return { status: "unavailable" };

  const hostname = expectedHostname(input.corsOrigin);
  if (!hostname) return { status: "unavailable" };
  const payload = new URLSearchParams({
    idempotency_key: input.idempotencyKey,
    remoteip: input.clientAddress,
    response: input.token,
    secret: configured.secretKey,
  });
  const result = await siteverify(payload, fetchImplementation);
  if (!result) return { status: "unavailable" };
  if (!result.success) return { status: "rejected", reason: "token" };
  if (result.action !== TURNSTILE_ACTION) return { status: "rejected", reason: "action" };
  if (result.hostname?.toLowerCase() !== hostname.toLowerCase()) {
    return { status: "rejected", reason: "hostname" };
  }
  const challengeTime = result.challenge_ts ? Date.parse(result.challenge_ts) : Number.NaN;
  const age = Date.now() - challengeTime;
  if (
    !Number.isFinite(challengeTime) ||
    age > TURNSTILE_MAX_AGE_MS ||
    age < -TURNSTILE_CLOCK_SKEW_MS
  ) {
    return { status: "rejected", reason: "expired" };
  }
  return { status: "verified" };
}
