import {
  assertCapability,
  assertTenantResource,
  hasCapability,
  type TenantContext,
} from "@wyceno/database";
import { z } from "zod";

import { createClient } from "../supabase/server";

export const organizationNameSchema = z.string().trim().min(2).max(120);
export const leadAlertEmailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));

export type OrganizationSettings = Readonly<{
  createdAt: string;
  currentUserEmail: string | null;
  leadAlertEmail: string | null;
  name: string;
  role: TenantContext["role"];
  slug: string;
}>;

export async function getOrganizationSettings(
  context: TenantContext,
): Promise<OrganizationSettings> {
  assertCapability(context, "organization:read");
  const supabase = await createClient();
  const canManageNotifications = hasCapability(context, "notification:manage");
  const [{ data: organization, error }, { data: authData }, notificationSettingsResult] =
    await Promise.all([
      supabase
        .from("organizations")
        .select("id, name, slug, created_at")
        .eq("id", context.organizationId)
        .maybeSingle(),
      supabase.auth.getUser(),
      canManageNotifications
        ? supabase
            .from("organization_notification_settings")
            .select("lead_alert_email")
            .eq("organization_id", context.organizationId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

  if (error || !organization || notificationSettingsResult.error) {
    throw new Error("Nie udało się pobrać ustawień organizacji.");
  }
  assertTenantResource(context, organization.id);

  return {
    createdAt: organization.created_at,
    currentUserEmail: authData.user?.email ?? null,
    leadAlertEmail: notificationSettingsResult.data?.lead_alert_email ?? null,
    name: organization.name,
    role: context.role,
    slug: organization.slug,
  };
}

export async function updateLeadAlertEmail(
  context: TenantContext,
  nextEmail: string,
): Promise<void> {
  assertCapability(context, "notification:manage");
  const email = leadAlertEmailSchema.parse(nextEmail);
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_organization_lead_alert_email", {
    target_email: email,
    target_organization_id: context.organizationId,
  });
  if (error) throw new Error("Nie udało się zapisać adresu alertów.");
}

export async function updateOrganizationName(
  context: TenantContext,
  nextName: string,
): Promise<void> {
  assertCapability(context, "organization:update");
  const name = organizationNameSchema.parse(nextName);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .update({ name })
    .eq("id", context.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    throw new Error("Nie udało się zapisać nazwy organizacji.");
  }
  assertTenantResource(context, data.id);
}
