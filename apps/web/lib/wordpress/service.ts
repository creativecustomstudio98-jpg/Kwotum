import { assertCapability } from "@wyceno/database";

import { requireTenantContext } from "../auth/tenant-context";
import { createClient } from "../supabase/server";
import { wordpressInstallTokenResponseSchema, wordpressSiteOriginSchema } from "./contracts";

export type WordPressConnectionSummary = Readonly<{
  connectedAt: string;
  id: string;
  lastSeenAt: string;
  phpVersion: string;
  pluginVersion: string;
  revokedAt: string | null;
  siteOrigin: string;
  wordpressVersion: string;
}>;

export async function getWordPressIntegration(organizationId: string): Promise<
  Readonly<{
    connections: WordPressConnectionSummary[];
    organizationName: string;
  }>
> {
  const context = await requireTenantContext(organizationId);
  assertCapability(context, "wordpress:manage");
  const client = await createClient();
  const [organizationResult, connectionsResult] = await Promise.all([
    client.from("organizations").select("name").eq("id", context.organizationId).maybeSingle(),
    client
      .from("wordpress_connections")
      .select(
        "id, site_origin, plugin_version, wordpress_version, php_version, connected_at, last_seen_at, revoked_at",
      )
      .eq("organization_id", context.organizationId)
      .order("connected_at", { ascending: false })
      .limit(20),
  ]);
  if (organizationResult.error || !organizationResult.data || connectionsResult.error) {
    throw new Error("Nie udało się pobrać integracji WordPress.");
  }
  return {
    connections: connectionsResult.data.map((connection) => ({
      connectedAt: connection.connected_at,
      id: connection.id,
      lastSeenAt: connection.last_seen_at,
      phpVersion: connection.php_version,
      pluginVersion: connection.plugin_version,
      revokedAt: connection.revoked_at,
      siteOrigin: connection.site_origin,
      wordpressVersion: connection.wordpress_version,
    })),
    organizationName: organizationResult.data.name,
  };
}

export async function createWordPressInstallToken(organizationId: string, siteOrigin: string) {
  const context = await requireTenantContext(organizationId);
  assertCapability(context, "wordpress:manage");
  const origin = wordpressSiteOriginSchema.parse(siteOrigin);
  const client = await createClient();
  const { data, error } = await client.rpc("create_wordpress_install_token", {
    target_organization_id: context.organizationId,
    target_site_origin: origin,
  });
  if (error) throw new Error("Nie udało się utworzyć tokenu instalacyjnego.");
  return wordpressInstallTokenResponseSchema.parse(data);
}

export async function revokeWordPressConnection(
  organizationId: string,
  connectionId: string,
): Promise<void> {
  const context = await requireTenantContext(organizationId);
  assertCapability(context, "wordpress:manage");
  const client = await createClient();
  const { data, error } = await client.rpc("revoke_wordpress_connection", {
    target_connection_id: connectionId,
    target_organization_id: context.organizationId,
  });
  if (error || !data) throw new Error("Nie udało się unieważnić połączenia.");
}
