import { AuthorizationError } from "@wyceno/database";

import { requireTenantContext } from "../../../../../../../../lib/auth/tenant-context";
import { exportLeadPersonalData } from "../../../../../../../../lib/privacy/service";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ leadId: string; organizationId: string }> },
): Promise<Response> {
  const { leadId, organizationId } = await params;
  try {
    const context = await requireTenantContext(organizationId);
    const exported = await exportLeadPersonalData(context, leadId);
    return new Response(JSON.stringify(exported, null, 2), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="wyceno-lead-${leadId}.json"`,
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    const status = error instanceof AuthorizationError ? 404 : 503;
    return Response.json(
      {
        error: {
          code: status === 404 ? "NOT_FOUND" : "EXPORT_FAILED",
          message: status === 404 ? "Nie znaleziono zasobu." : "Eksport jest niedostępny.",
        },
      },
      { headers: { "Cache-Control": "private, no-store" }, status },
    );
  }
}
