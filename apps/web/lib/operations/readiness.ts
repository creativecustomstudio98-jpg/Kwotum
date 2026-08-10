import type { PublicSupabaseConfig } from "../supabase/env";
import { getPublicSupabaseConfig } from "../supabase/env";

const DEFAULT_READINESS_TIMEOUT_MS = 2_000;

type RuntimeReadinessOptions = Readonly<{
  config?: PublicSupabaseConfig;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}>;

export async function checkRuntimeReadiness(
  options: RuntimeReadinessOptions = {},
): Promise<boolean> {
  try {
    const { publishableKey, url } = options.config ?? getPublicSupabaseConfig();
    const fetchImpl = options.fetchImpl ?? fetch;
    const timeoutMs = options.timeoutMs ?? DEFAULT_READINESS_TIMEOUT_MS;
    const endpoint = new URL("/rest/v1/rpc/runtime_readiness_probe", url);
    const response = await fetchImpl(endpoint, {
      body: "{}",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) return false;

    const payload: unknown = await response.json();
    return payload === true;
  } catch {
    return false;
  }
}
