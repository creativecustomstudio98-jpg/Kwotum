import {
  assertCapability,
  assertTenantResource,
  AuthorizationError,
  type Json,
  type TenantContext,
} from "@wyceno/database";
import {
  flowDocumentSchema,
  flowDraftMetadataSchema,
  flowTemplates,
  storedFlowDocumentSchema,
  upgradeFlowDocument,
  type FlowDocument,
} from "@wyceno/validation";

import { createClient } from "../supabase/server";

export type FlowDraftSummary = Readonly<{
  draftRevision: number;
  id: string;
  name: string;
  organizationId: string;
  slug: string;
}>;

export type FlowListItem = Readonly<{
  draftRevision: number;
  id: string;
  latestPublishedAt: string | null;
  latestPublishedVersion: number | null;
  name: string;
  slug: string;
  status: "draft" | "published";
  stepCount: number;
  updatedAt: string;
}>;

export type FlowDraftDetail = Readonly<{
  document: FlowDocument;
  draftRevision: number;
  id: string;
  name: string;
  slug: string;
  updatedAt: string;
}>;

export class FlowDraftConflictError extends Error {
  readonly code = "FLOW_DRAFT_CONFLICT";

  constructor() {
    super("Proces został zmieniony w innej sesji.");
    this.name = "FlowDraftConflictError";
  }
}

function asJson(document: FlowDocument): Json {
  return document as unknown as Json;
}

async function requireScopedFlow(context: TenantContext, flowId: string): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("flows")
    .select("organization_id")
    .eq("id", flowId)
    .eq("organization_id", context.organizationId)
    .maybeSingle();

  if (error || !data) {
    throw new AuthorizationError("NOT_FOUND", "Resource not found.");
  }
  assertTenantResource(context, data.organization_id);
}

async function requireScopedVersion(context: TenantContext, versionId: string): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("flow_versions")
    .select("organization_id")
    .eq("id", versionId)
    .eq("organization_id", context.organizationId)
    .maybeSingle();

  if (error || !data) {
    throw new AuthorizationError("NOT_FOUND", "Resource not found.");
  }
  assertTenantResource(context, data.organization_id);
}

export async function listFlowDrafts(context: TenantContext): Promise<FlowListItem[]> {
  assertCapability(context, "flow:read");
  const supabase = await createClient();
  const [flowsResult, versionsResult] = await Promise.all([
    supabase
      .from("flows")
      .select("id, name, slug, draft, draft_revision, updated_at")
      .eq("organization_id", context.organizationId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("flow_versions")
      .select("flow_id, version_number, status, published_at")
      .eq("organization_id", context.organizationId)
      .eq("status", "published")
      .order("version_number", { ascending: false }),
  ]);
  if (flowsResult.error || versionsResult.error) {
    throw new Error("Nie udało się pobrać procesów.");
  }
  return flowsResult.data.map((flow) => {
    const latestVersion = versionsResult.data.find((version) => version.flow_id === flow.id);
    const parsedDraft = storedFlowDocumentSchema.safeParse(flow.draft);
    return {
      draftRevision: flow.draft_revision,
      id: flow.id,
      latestPublishedAt: latestVersion?.published_at ?? null,
      latestPublishedVersion: latestVersion?.version_number ?? null,
      name: flow.name,
      slug: flow.slug,
      status: latestVersion ? "published" : "draft",
      stepCount: parsedDraft.success ? parsedDraft.data.steps.length : 0,
      updatedAt: flow.updated_at,
    };
  });
}

export async function getFlowDraft(
  context: TenantContext,
  flowId: string,
): Promise<FlowDraftDetail> {
  assertCapability(context, "flow:read");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("flows")
    .select("id, organization_id, name, slug, draft, draft_revision, updated_at")
    .eq("id", flowId)
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  if (error || !data) {
    throw new AuthorizationError("NOT_FOUND", "Resource not found.");
  }
  assertTenantResource(context, data.organization_id);
  const document = storedFlowDocumentSchema.safeParse(data.draft);
  if (!document.success) {
    throw new Error("Draft procesu ma nieprawidłowy format.");
  }
  return {
    document: upgradeFlowDocument(document.data),
    draftRevision: data.draft_revision,
    id: data.id,
    name: data.name,
    slug: data.slug,
    updatedAt: data.updated_at,
  };
}

export async function createFlowDraft(
  context: TenantContext,
  input: Readonly<{
    document: FlowDocument;
    name: string;
    slug: string;
  }>,
): Promise<FlowDraftSummary> {
  assertCapability(context, "flow:write");
  const document = flowDocumentSchema.parse(input.document);
  const metadata = flowDraftMetadataSchema.parse({
    name: input.name,
    slug: input.slug,
  });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("flows")
    .insert({
      created_by: context.userId,
      draft: asJson(document),
      name: metadata.name,
      organization_id: context.organizationId,
      slug: metadata.slug,
      updated_by: context.userId,
    })
    .select("id, organization_id, name, slug, draft_revision")
    .single();

  if (error) {
    throw new Error("Nie udało się utworzyć procesu.");
  }

  return {
    draftRevision: data.draft_revision,
    id: data.id,
    name: data.name,
    organizationId: data.organization_id,
    slug: data.slug,
  };
}

export async function createFlowFromTemplate(
  context: TenantContext,
  input: Readonly<{
    name: string;
    slug: string;
    templateSlug: string;
  }>,
): Promise<FlowDraftSummary> {
  const template = flowTemplates.find((item) => item.slug === input.templateSlug);
  if (!template) {
    throw new AuthorizationError("NOT_FOUND", "Template not found.");
  }
  return createFlowDraft(context, {
    document: structuredClone(template.snapshot),
    name: input.name,
    slug: input.slug,
  });
}

export async function saveFlowDraft(
  context: TenantContext,
  input: Readonly<{
    document: FlowDocument;
    expectedDraftRevision: number;
    flowId: string;
    name: string;
  }>,
): Promise<number> {
  assertCapability(context, "flow:write");
  await requireScopedFlow(context, input.flowId);
  const document = flowDocumentSchema.parse(input.document);
  const name = flowDraftMetadataSchema.shape.name.parse(input.name);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("flows")
    .update({
      draft: asJson(document),
      name,
      updated_by: context.userId,
    })
    .eq("id", input.flowId)
    .eq("organization_id", context.organizationId)
    .eq("draft_revision", input.expectedDraftRevision)
    .select("draft_revision")
    .maybeSingle();

  if (error) {
    throw new Error("Nie udało się zapisać procesu.");
  }
  if (!data) {
    throw new FlowDraftConflictError();
  }
  return data.draft_revision;
}

export async function validateFlowDraft(context: TenantContext, flowId: string): Promise<Json> {
  assertCapability(context, "flow:read");
  await requireScopedFlow(context, flowId);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("validate_flow", {
    target_flow_id: flowId,
  });
  if (error) {
    throw new Error("Nie udało się zweryfikować procesu.");
  }
  return data;
}

export async function publishFlowDraft(
  context: TenantContext,
  input: Readonly<{
    expectedDraftRevision: number;
    flowId: string;
  }>,
): Promise<Json> {
  assertCapability(context, "flow:publish");
  await requireScopedFlow(context, input.flowId);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("publish_flow", {
    expected_draft_revision: input.expectedDraftRevision,
    target_flow_id: input.flowId,
  });
  if (error) {
    if (error.code === "40001") throw new FlowDraftConflictError();
    throw new Error("Proces nie może zostać opublikowany.");
  }
  return data;
}

export async function archiveFlowVersion(context: TenantContext, versionId: string): Promise<Json> {
  assertCapability(context, "flow:publish");
  await requireScopedVersion(context, versionId);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("archive_flow_version", {
    target_version_id: versionId,
  });
  if (error) {
    throw new Error("Nie udało się zarchiwizować wersji procesu.");
  }
  return data;
}
