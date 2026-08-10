import { createClient } from "../supabase/server";

export type OrganizationBootstrapResult =
  | Readonly<{ organizationId: string; status: "created" }>
  | Readonly<{ organizationId: string; status: "existing" }>
  | Readonly<{ status: "missing-profile-data" }>;

export async function getCurrentOrganizationId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error) throw new Error("Nie udało się sprawdzić organizacji użytkownika.");
  return data?.organization_id ?? null;
}

export async function createOrganizationForCurrentUser(
  name: string,
  slug: string,
): Promise<OrganizationBootstrapResult> {
  const existingOrganizationId = await getCurrentOrganizationId();
  if (existingOrganizationId) {
    return { organizationId: existingOrganizationId, status: "existing" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_organization", {
    organization_name: name,
    organization_slug: slug,
  });
  const organization = data?.[0];

  if (error || !organization) {
    throw new Error("Nie udało się bezpiecznie utworzyć organizacji.");
  }

  return { organizationId: organization.id, status: "created" };
}

export async function ensureOrganizationFromUserMetadata(): Promise<OrganizationBootstrapResult> {
  const existingOrganizationId = await getCurrentOrganizationId();
  if (existingOrganizationId) {
    return { organizationId: existingOrganizationId, status: "existing" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "missing-profile-data" };

  const name = user.user_metadata.organization_name;
  const slug = user.user_metadata.organization_slug;
  if (typeof name !== "string" || typeof slug !== "string") {
    return { status: "missing-profile-data" };
  }

  return createOrganizationForCurrentUser(name, slug);
}
