import { createHmac } from "node:crypto";
import { isIP } from "node:net";

import { z } from "zod";

import { createServiceClient } from "../supabase/service";
import { errorResponse, optionsResponse } from "./http";

export type PublicRequestAction =
  | "answer"
  | "consent"
  | "event"
  | "file"
  | "manifest"
  | "result"
  | "session_create"
  | "session_read"
  | "submit";

type GuardTarget = Readonly<{
  publicId?: string | undefined;
  sessionToken?: string | undefined;
}>;

export type AllowedPublicRequest = Readonly<{
  clientAddress: string;
  corsOrigin: string | null;
}>;

type GuardedPublicRequest =
  | Readonly<{ allowed: true; context: AllowedPublicRequest }>
  | Readonly<{ allowed: false; response: Response }>;

const guardResultSchema = z
  .object({
    allowed: z.boolean(),
    reason: z.enum(["invalid_request", "origin", "rate", "resource"]).optional(),
    retryAfter: z.number().int().min(1).max(3600).optional(),
  })
  .passthrough();

function applicationOrigin(): string {
  return new URL(process.env.APP_URL ?? "http://localhost:3000").origin;
}

export function normalizePublicOrigin(value: string): string | null {
  if (value.length > 255 || value !== value.trim()) return null;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  const loopback =
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "[::1]";
  if (
    (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && loopback)) ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    return null;
  }
  return parsed.origin;
}

function clientAddress(request: Request): string | null {
  const deployment = process.env.DEPLOYMENT_ENV ?? "local";
  const vercelAddress = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercelAddress && isIP(vercelAddress)) return vercelAddress;
  if (deployment !== "local") return null;
  const localForwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (localForwarded && isIP(localForwarded)) return localForwarded;
  return "127.0.0.1";
}

function rateLimitSecret(): string | null {
  const configured = process.env.PUBLIC_RATE_LIMIT_SECRET;
  if (configured && configured.length >= 32) return configured;
  return (process.env.DEPLOYMENT_ENV ?? "local") === "local"
    ? "kwotum-local-rate-limit-fingerprint-v1"
    : null;
}

async function runGuard(
  request: Request,
  action: PublicRequestAction | "preflight",
  target: GuardTarget,
  id: string,
): Promise<GuardedPublicRequest> {
  const suppliedOrigin = request.headers.get("origin");
  const normalizedOrigin = suppliedOrigin ? normalizePublicOrigin(suppliedOrigin) : null;
  if (suppliedOrigin && !normalizedOrigin) {
    return {
      allowed: false,
      response: errorResponse(
        "ORIGIN_NOT_ALLOWED",
        "Ta domena nie ma dostępu do formularza.",
        403,
        id,
      ),
    };
  }
  const address = clientAddress(request);
  const secret = rateLimitSecret();
  if (!address || !secret) {
    return {
      allowed: false,
      response: errorResponse(
        "UNAVAILABLE",
        "Usługa jest chwilowo niedostępna. Spróbuj ponownie.",
        503,
        id,
      ),
    };
  }
  const fingerprint = createHmac("sha256", secret).update(address, "utf8").digest("hex");
  const { data, error } = await createServiceClient().rpc("enforce_public_request_guard", {
    application_origin: applicationOrigin(),
    client_fingerprint: fingerprint,
    request_action: action,
    request_origin: normalizedOrigin,
    session_token: target.sessionToken ?? null,
    target_public_id: target.publicId ?? null,
  });
  if (error) {
    return {
      allowed: false,
      response: errorResponse(
        "UNAVAILABLE",
        "Usługa jest chwilowo niedostępna. Spróbuj ponownie.",
        503,
        id,
        normalizedOrigin,
      ),
    };
  }
  const result = guardResultSchema.safeParse(data);
  if (!result.success) {
    return {
      allowed: false,
      response: errorResponse(
        "UNAVAILABLE",
        "Usługa jest chwilowo niedostępna. Spróbuj ponownie.",
        503,
        id,
        normalizedOrigin,
      ),
    };
  }
  if (result.data.allowed) {
    return { allowed: true, context: { clientAddress: address, corsOrigin: normalizedOrigin } };
  }
  if (result.data.reason === "origin") {
    return {
      allowed: false,
      response: errorResponse(
        "ORIGIN_NOT_ALLOWED",
        "Ta domena nie ma dostępu do formularza.",
        403,
        id,
      ),
    };
  }
  if (result.data.reason === "rate") {
    return {
      allowed: false,
      response: errorResponse(
        "RATE_LIMITED",
        "Za dużo żądań. Spróbuj ponownie za chwilę.",
        429,
        id,
        normalizedOrigin,
        result.data.retryAfter ?? 60,
      ),
    };
  }
  if (result.data.reason === "resource") {
    const sessionRequest = Boolean(target.sessionToken);
    return {
      allowed: false,
      response: errorResponse(
        sessionRequest ? "SESSION_NOT_FOUND" : "FLOW_NOT_FOUND",
        sessionRequest ? "Nie znaleziono sesji." : "Ten proces jest niedostępny.",
        404,
        id,
        normalizedOrigin,
      ),
    };
  }
  return {
    allowed: false,
    response: errorResponse(
      "UNAVAILABLE",
      "Usługa jest chwilowo niedostępna. Spróbuj ponownie.",
      503,
      id,
      normalizedOrigin,
    ),
  };
}

export async function guardPublicRequest(
  request: Request,
  action: PublicRequestAction,
  target: GuardTarget,
  id: string,
): Promise<GuardedPublicRequest> {
  return runGuard(request, action, target, id);
}

export async function guardPublicOptions(
  request: Request,
  target: GuardTarget = {},
): Promise<Response> {
  const id = crypto.randomUUID();
  const guard = await runGuard(request, "preflight", target, id);
  return guard.allowed ? optionsResponse(guard.context.corsOrigin) : guard.response;
}
