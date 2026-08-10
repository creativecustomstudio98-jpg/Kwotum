import { analyticsOverviewSchema, type AnalyticsOverview } from "@wyceno/analytics";
import { assertCapability } from "@wyceno/database";

import { requireTenantContext } from "../auth/tenant-context";
import { createClient } from "../supabase/server";

export type AnalyticsPeriodDays = 7 | 30 | 90;

export async function getAnalyticsOverview(
  organizationId: string,
  days: AnalyticsPeriodDays,
  periodEnd = new Date(),
): Promise<Readonly<{ organizationName: string; overview: AnalyticsOverview }>> {
  const context = await requireTenantContext(organizationId);
  assertCapability(context, "analytics:summary");
  const client = await createClient();
  const periodStart = new Date(periodEnd.getTime() - days * 24 * 60 * 60 * 1000);
  const [organizationResult, analyticsResult] = await Promise.all([
    client.from("organizations").select("name").eq("id", context.organizationId).maybeSingle(),
    client.rpc("get_analytics_overview", {
      period_end: periodEnd.toISOString(),
      period_start: periodStart.toISOString(),
      target_organization_id: context.organizationId,
    }),
  ]);
  if (organizationResult.error || !organizationResult.data) {
    throw new Error("Nie udało się pobrać organizacji.");
  }
  if (analyticsResult.error) {
    throw new Error("Nie udało się obliczyć analityki.");
  }
  const parsed = analyticsOverviewSchema.safeParse(analyticsResult.data);
  if (!parsed.success) {
    throw new Error("Serwer zwrócił nieprawidłową analitykę.");
  }
  return { organizationName: organizationResult.data.name, overview: parsed.data };
}
