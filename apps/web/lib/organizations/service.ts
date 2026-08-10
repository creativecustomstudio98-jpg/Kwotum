import { assertCapability, assertTenantResource, type TenantContext } from "@wyceno/database";
import { z } from "zod";

import { createClient } from "../supabase/server";

export const organizationNameSchema = z.string().trim().min(2).max(120);

export type OrganizationSettings = Readonly<{
  createdAt: string;
  currentUserEmail: string | null;
  name: string;
  role: TenantContext["role"];
  slug: string;
}>;

export async function getOrganizationSettings(
  context: TenantContext,
): Promise<OrganizationSettings> {
  assertCapability(context, "organization:read");
  const supabase = await createClient();
  const [{ data: organization, error }, { data: authData }] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, slug, created_at")
      .eq("id", context.organizationId)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (error || !organization) {
    throw new Error("Nie udało się pobrać ustawień organizacji.");
  }
  assertTenantResource(context, organization.id);

  return {
    createdAt: organization.created_at,
    currentUserEmail: authData.user?.email ?? null,
    name: organization.name,
    role: context.role,
    slug: organization.slug,
  };
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
