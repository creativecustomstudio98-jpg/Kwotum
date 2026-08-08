import { checkRuntimeReadiness } from "../../lib/operations/readiness";

type ReadinessProbe = () => Promise<boolean>;

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

export async function createReadinessResponse(
  probe: ReadinessProbe = checkRuntimeReadiness,
): Promise<Response> {
  const ready = await probe();

  return Response.json(
    {
      service: "web",
      status: ready ? "ready" : "unavailable",
    },
    {
      headers: responseHeaders,
      status: ready ? 200 : 503,
    },
  );
}

export async function GET(): Promise<Response> {
  return createReadinessResponse();
}
