import { AuthorizationError, createTenantContext, type TenantContext } from "@wyceno/database";

import { createClient } from "../supabase/server";

export async function requireTenantContext(organizationId: string): Promise<TenantContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthorizationError("FORBIDDEN", "Authentication is required.");
  }

  const { data: membership, error } = await supabase
    .from("organization_members")
    .select("organization_id, role, status, user_id")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !membership) {
    throw new AuthorizationError("NOT_FOUND", "Resource not found.");
  }

  return createTenantContext({
    organizationId: membership.organization_id,
    role: membership.role,
    status: membership.status,
    userId: membership.user_id,
  });
}
