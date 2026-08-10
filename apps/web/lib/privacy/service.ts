import { assertCapability, type Json, type TenantContext } from "@wyceno/database";

import { createClient } from "../supabase/server";

export type PrivacyPolicy = Readonly<{
  approvedAt: string | null;
  retentionDays: number | null;
}>;

export type LeadLegalHold = Readonly<{
  createdAt: string;
  reason: string;
}>;

export async function getPrivacyPolicy(context: TenantContext): Promise<PrivacyPolicy> {
  assertCapability(context, "privacy:manage");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_data_policies")
    .select("lead_retention_days, retention_approved_at")
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  if (error) throw new Error("Nie udało się pobrać polityki retencji.");
  return {
    approvedAt: data?.retention_approved_at ?? null,
    retentionDays: data?.lead_retention_days ?? null,
  };
}

export async function setPrivacyRetention(
  context: TenantContext,
  retentionDays: number | null,
): Promise<void> {
  assertCapability(context, "privacy:manage");
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_organization_retention", {
    target_lead_retention_days: retentionDays,
    target_organization_id: context.organizationId,
  });
  if (error) throw new Error("Nie udało się zapisać polityki retencji.");
}

export async function getLeadLegalHold(
  context: TenantContext,
  leadId: string,
): Promise<LeadLegalHold | null> {
  assertCapability(context, "privacy:manage");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_legal_holds")
    .select("created_at, reason")
    .eq("organization_id", context.organizationId)
    .eq("lead_id", leadId)
    .maybeSingle();
  if (error) throw new Error("Nie udało się pobrać blokady prawnej.");
  return data ? { createdAt: data.created_at, reason: data.reason } : null;
}

export async function setLeadLegalHold(
  context: TenantContext,
  leadId: string,
  reason: string,
): Promise<void> {
  assertCapability(context, "privacy:manage");
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_lead_legal_hold", {
    target_lead_id: leadId,
    target_organization_id: context.organizationId,
    target_reason: reason,
  });
  if (error) throw new Error("Nie udało się ustawić blokady prawnej.");
}

export async function releaseLeadLegalHold(context: TenantContext, leadId: string): Promise<void> {
  assertCapability(context, "privacy:manage");
  const supabase = await createClient();
  const { error } = await supabase.rpc("release_lead_legal_hold", {
    target_lead_id: leadId,
    target_organization_id: context.organizationId,
  });
  if (error) throw new Error("Nie udało się zwolnić blokady prawnej.");
}

export async function exportLeadPersonalData(
  context: TenantContext,
  leadId: string,
): Promise<Json> {
  assertCapability(context, "privacy:manage");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("export_lead_personal_data", {
    target_lead_id: leadId,
    target_organization_id: context.organizationId,
  });
  if (error) throw new Error("Nie udało się wyeksportować danych leada.");
  return data;
}

export async function eraseLeadPersonalData(context: TenantContext, leadId: string): Promise<void> {
  assertCapability(context, "privacy:manage");
  const supabase = await createClient();
  const { data: objectPaths, error: pathsError } = await supabase.rpc(
    "get_lead_erasure_storage_paths",
    {
      target_lead_id: leadId,
      target_organization_id: context.organizationId,
    },
  );
  if (pathsError) throw new Error("Nie można usunąć leada objętego blokadą.");
  if (objectPaths.length > 0) {
    const { error } = await supabase.storage.from("tenant-private").remove(objectPaths);
    if (error) throw new Error("Nie udało się usunąć plików leada.");
  }
  const { error } = await supabase.rpc("erase_lead_personal_data", {
    target_lead_id: leadId,
    target_organization_id: context.organizationId,
  });
  if (error) throw new Error("Nie udało się usunąć danych leada.");
}
