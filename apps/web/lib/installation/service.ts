import {
  assertCapability,
  assertTenantResource,
  AuthorizationError,
  type TenantContext,
} from "@wyceno/database";
import { widgetManifestSchema, type WidgetManifestContract } from "@wyceno/validation";
import { z } from "zod";

import { createClient } from "../supabase/server";

export type FlowInstallation = Readonly<{
  allowedOrigins: ReadonlyArray<string>;
  currentVersion: number | null;
  flowId: string;
  flowName: string;
  invitations: ReadonlyArray<
    Readonly<{
      attemptCount: number;
      createdAt: string;
      createdByName: string;
      id: string;
      lastErrorCode: string | null;
      recipientEmail: string;
      recipientName: string | null;
      sentAt: string | null;
      status: "failed" | "pending" | "processing" | "retry" | "sent";
      versionNumber: number;
    }>
  >;
  lastWidgetOpenedAt: string | null;
  manifest: WidgetManifestContract | null;
  organizationName: string;
  publicId: string | null;
  publishedAt: string | null;
  wordpressConnection: Readonly<{
    lastSeenAt: string;
    siteOrigin: string;
  }> | null;
}>;

export async function getFlowInstallation(
  context: TenantContext,
  flowId: string,
): Promise<FlowInstallation> {
  assertCapability(context, "flow:read");
  const supabase = await createClient();
  const [
    organizationResult,
    flowResult,
    publishedResult,
    eventResult,
    wordpressResult,
    originsResult,
  ] = await Promise.all([
    supabase.from("organizations").select("name").eq("id", context.organizationId).maybeSingle(),
    supabase
      .from("flows")
      .select("id, organization_id, name")
      .eq("id", flowId)
      .eq("organization_id", context.organizationId)
      .maybeSingle(),
    supabase
      .from("published_flows")
      .select("public_id, published_at, flow_version_id")
      .eq("flow_id", flowId)
      .eq("organization_id", context.organizationId)
      .maybeSingle(),
    supabase
      .from("session_events")
      .select("occurred_at")
      .eq("flow_id", flowId)
      .eq("organization_id", context.organizationId)
      .eq("name", "widget_opened")
      .order("occurred_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("wordpress_connections")
      .select("site_origin, last_seen_at")
      .eq("organization_id", context.organizationId)
      .is("revoked_at", null)
      .order("last_seen_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("public_flow_origins")
      .select("origin")
      .eq("organization_id", context.organizationId)
      .eq("flow_id", flowId)
      .order("origin", { ascending: true }),
  ]);

  if (flowResult.error || !flowResult.data) {
    throw new AuthorizationError("NOT_FOUND", "Resource not found.");
  }
  assertTenantResource(context, flowResult.data.organization_id);

  if (
    organizationResult.error ||
    !organizationResult.data ||
    publishedResult.error ||
    eventResult.error ||
    wordpressResult.error ||
    originsResult.error
  ) {
    throw new Error("Nie udało się pobrać danych instalacji.");
  }

  const [manifestResult, invitationsResult, currentVersionResult] = await Promise.all([
    publishedResult.data?.public_id
      ? supabase.rpc("get_flow_installation_manifest", {
          target_flow_id: flowId,
          target_organization_id: context.organizationId,
        })
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from("flow_invitations")
      .select(
        "id, flow_version_id, recipient_email, recipient_name, status, attempt_count, last_error_code, sent_at, created_at, created_by",
      )
      .eq("organization_id", context.organizationId)
      .eq("flow_id", flowId)
      .order("created_at", { ascending: false })
      .limit(20),
    publishedResult.data?.flow_version_id
      ? supabase
          .from("flow_versions")
          .select("version_number")
          .eq("organization_id", context.organizationId)
          .eq("id", publishedResult.data.flow_version_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (manifestResult.error || invitationsResult.error || currentVersionResult.error) {
    throw new Error("Nie udało się pobrać podglądu i historii udostępnień.");
  }
  const manifest = manifestResult.data ? widgetManifestSchema.parse(manifestResult.data) : null;
  const creatorIds = [...new Set(invitationsResult.data.map((item) => item.created_by))];
  const versionIds = [...new Set(invitationsResult.data.map((item) => item.flow_version_id))];
  const [creatorsResult, versionsResult] = await Promise.all([
    creatorIds.length
      ? supabase.from("profiles").select("id, display_name").in("id", creatorIds)
      : Promise.resolve({ data: [], error: null }),
    versionIds.length
      ? supabase
          .from("flow_versions")
          .select("id, version_number")
          .eq("organization_id", context.organizationId)
          .in("id", versionIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (creatorsResult.error || versionsResult.error) {
    throw new Error("Nie udało się pobrać autorów historii udostępnień.");
  }
  const creatorNames = new Map(
    creatorsResult.data.map((profile) => [
      profile.id,
      profile.display_name ?? "Użytkownik zespołu",
    ]),
  );
  const versionNumbers = new Map(
    versionsResult.data.map((version) => [version.id, version.version_number]),
  );

  return {
    allowedOrigins: originsResult.data.map((item) => item.origin),
    currentVersion: currentVersionResult.data?.version_number ?? null,
    flowId: flowResult.data.id,
    flowName: flowResult.data.name,
    invitations: invitationsResult.data.map((invitation) => ({
      attemptCount: invitation.attempt_count,
      createdAt: invitation.created_at,
      createdByName: creatorNames.get(invitation.created_by) ?? "Użytkownik zespołu",
      id: invitation.id,
      lastErrorCode: invitation.last_error_code,
      recipientEmail: invitation.recipient_email,
      recipientName: invitation.recipient_name,
      sentAt: invitation.sent_at,
      status: invitation.status,
      versionNumber: versionNumbers.get(invitation.flow_version_id) ?? 0,
    })),
    lastWidgetOpenedAt: eventResult.data?.occurred_at ?? null,
    manifest,
    organizationName: organizationResult.data.name,
    publicId: publishedResult.data?.public_id ?? null,
    publishedAt: publishedResult.data?.published_at ?? null,
    wordpressConnection: wordpressResult.data
      ? {
          lastSeenAt: wordpressResult.data.last_seen_at,
          siteOrigin: wordpressResult.data.site_origin,
        }
      : null,
  };
}

export async function setFlowAllowedOrigins(
  context: TenantContext,
  flowId: string,
  origins: ReadonlyArray<string>,
): Promise<void> {
  assertCapability(context, "flow:share");
  if (origins.length > 10) throw new Error("Za dużo dozwolonych domen.");
  const normalizedOrigins: string[] = [];
  for (const origin of origins) {
    const normalized = normalizeInstallationOrigin(origin);
    if (!normalized) throw new Error("Nieprawidłowy origin.");
    normalizedOrigins.push(normalized);
  }
  const uniqueOrigins = [...new Set(normalizedOrigins)];
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_public_flow_origins", {
    target_flow_id: flowId,
    target_organization_id: context.organizationId,
    target_origins: uniqueOrigins,
  });
  if (error) {
    if (error.code === "42501" || error.code === "P0002") {
      throw new AuthorizationError("NOT_FOUND", "Resource not found.");
    }
    throw new Error("Nie udało się zapisać dozwolonych domen.");
  }
}

function normalizeInstallationOrigin(value: string): string | null {
  const candidate = value.trim();
  if (!candidate || candidate.length > 255) return null;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }
  const loopback =
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "[::1]";
  if (
    (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && loopback)) ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    (parsed.pathname !== "/" && parsed.pathname !== "")
  ) {
    return null;
  }
  return parsed.origin;
}

const invitationResultSchema = z.object({
  createdAt: z.iso.datetime({ offset: true }),
  id: z.uuid(),
  status: z.enum(["pending", "processing", "retry", "sent", "failed"]),
});

export async function createFlowInvitation(
  context: TenantContext,
  input: Readonly<{
    flowId: string;
    message: string | null;
    recipientEmail: string;
    recipientName: string | null;
    requestId: string;
  }>,
) {
  assertCapability(context, "flow:share");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_flow_invitation", {
    idempotency_key: input.requestId,
    target_flow_id: input.flowId,
    target_organization_id: context.organizationId,
    target_personal_message: input.message,
    target_recipient_email: input.recipientEmail,
    target_recipient_name: input.recipientName,
  });
  if (error) {
    if (error.code === "42501" || error.code === "P0002") {
      throw new AuthorizationError("NOT_FOUND", "Resource not found.");
    }
    throw new Error("Nie udało się dodać wiadomości do kolejki.");
  }
  return invitationResultSchema.parse(data);
}
