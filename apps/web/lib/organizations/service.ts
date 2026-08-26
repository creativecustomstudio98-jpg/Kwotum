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
export const brandDisplayNameSchema = z.string().trim().max(120);
export const brandAccentColorSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^(?:#[0-9A-F]{6})?$/);

export type OrganizationSettings = Readonly<{
  brandAccentColor: string | null;
  brandDisplayName: string | null;
  brandLogoAssetId: string | null;
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
        .select(
          "id, name, slug, created_at, brand_display_name, brand_accent_color, brand_logo_asset_id",
        )
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
    brandAccentColor: organization.brand_accent_color,
    brandDisplayName: organization.brand_display_name,
    brandLogoAssetId: organization.brand_logo_asset_id,
    createdAt: organization.created_at,
    currentUserEmail: authData.user?.email ?? null,
    leadAlertEmail: notificationSettingsResult.data?.lead_alert_email ?? null,
    name: organization.name,
    role: context.role,
    slug: organization.slug,
  };
}

export async function updateOrganizationBranding(
  context: TenantContext,
  input: Readonly<{ accentColor: string; displayName: string; logoAssetId: string | null }>,
): Promise<void> {
  assertCapability(context, "organization:update");
  const accentColor = brandAccentColorSchema.parse(input.accentColor);
  const displayName = brandDisplayNameSchema.parse(input.displayName);
  const logoAssetId = input.logoAssetId === null ? null : z.uuid().parse(input.logoAssetId);
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_organization_branding", {
    target_accent_color: accentColor,
    target_display_name: displayName,
    target_logo_asset_id: logoAssetId,
    target_organization_id: context.organizationId,
  });
  if (error) throw new Error("Nie udało się zapisać brandingu.");
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
