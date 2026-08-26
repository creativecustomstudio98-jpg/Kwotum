import { assertCapability, type TenantContext } from "@wyceno/database";

import { createClient } from "../supabase/server";
import { operationalLeadOverviewSchema, type OperationalLeadOverview } from "./contracts";

export async function getOperationalLeadOverview(
  context: TenantContext,
  periodStart: Date,
  periodEnd: Date,
): Promise<OperationalLeadOverview> {
  assertCapability(context, "lead:read");
  if (
    !Number.isFinite(periodStart.getTime()) ||
    !Number.isFinite(periodEnd.getTime()) ||
    periodEnd <= periodStart
  ) {
    throw new Error("Nieprawidłowy okres danych operacyjnych.");
  }

  const client = await createClient();
  const { data, error } = await client.rpc("get_operational_lead_overview", {
    period_end: periodEnd.toISOString(),
    period_start: periodStart.toISOString(),
    target_organization_id: context.organizationId,
  });
  if (error) throw new Error("Nie udało się obliczyć danych operacyjnych leadów.");

  const parsed = operationalLeadOverviewSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Serwer zwrócił nieprawidłowe dane operacyjne leadów.");
  }
  return parsed.data;
}
