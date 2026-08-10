"use server";

import { flowDocumentSchema } from "@wyceno/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireTenantContext } from "../../../../lib/auth/tenant-context";
import {
  createFlowFromTemplate,
  FlowDraftConflictError,
  publishFlowDraft,
  saveFlowDraft,
} from "../../../../lib/flows/service";

export type FlowActionCode = "CONFLICT" | "INVALID" | "PUBLISH_FAILED" | "SAVE_FAILED";

export type FlowActionState = Readonly<{
  code: FlowActionCode | null;
  error: string | null;
  revision: number | null;
  success: string | null;
}>;

const flowDraftRequestSchema = z
  .object({
    document: flowDocumentSchema,
    expectedDraftRevision: z.number().int().positive(),
    flowId: z.uuid(),
    name: z.string().trim().min(2).max(160),
    organizationId: z.uuid(),
  })
  .strict();

export async function createFlowFromTemplateAction(
  _previousState: FlowActionState,
  formData: FormData,
): Promise<FlowActionState> {
  const organizationId = String(formData.get("organizationId") ?? "");
  const templateSlug = String(formData.get("templateSlug") ?? "");
  const templateName = String(formData.get("templateName") ?? "");
  let draftId: string;
  try {
    const context = await requireTenantContext(organizationId);
    const draft = await createFlowFromTemplate(context, {
      name: templateName,
      slug: `${templateSlug}-${crypto.randomUUID().slice(0, 8)}`,
      templateSlug,
    });
    draftId = draft.id;
  } catch (error) {
    return {
      code: "SAVE_FAILED",
      error: error instanceof Error ? error.message : "Nie udało się utworzyć procesu.",
      revision: null,
      success: null,
    };
  }
  revalidatePath(`/panel/${organizationId}/procesy`);
  redirect(`/panel/${organizationId}/procesy/${draftId}`);
}

export async function saveFlowDraftAction(
  _previousState: FlowActionState,
  formData: FormData,
): Promise<FlowActionState> {
  const input = parseFlowForm(formData);
  if (!input.success) return input.state;
  const state = await saveFlowDraftRequestAction(input);
  if (!state.error) {
    revalidatePath(`/panel/${input.organizationId}/procesy`);
  }
  return state;
}

export async function publishFlowDraftAction(
  _previousState: FlowActionState,
  formData: FormData,
): Promise<FlowActionState> {
  const input = parseFlowForm(formData);
  if (!input.success) return input.state;
  const state = await publishFlowDraftRequestAction(input);
  if (!state.error) {
    revalidatePath(`/panel/${input.organizationId}/procesy`);
    revalidatePath(`/panel/${input.organizationId}/procesy/${input.flowId}`);
  }
  return state;
}

export async function saveFlowDraftRequestAction(input: unknown): Promise<FlowActionState> {
  const parsed = flowDraftRequestSchema.safeParse(input);
  if (!parsed.success) {
    return invalidFlowActionState();
  }
  try {
    const context = await requireTenantContext(parsed.data.organizationId);
    const revision = await saveFlowDraft(context, {
      document: parsed.data.document,
      expectedDraftRevision: parsed.data.expectedDraftRevision,
      flowId: parsed.data.flowId,
      name: parsed.data.name,
    });
    return { code: null, error: null, revision, success: "Zapisano zmiany." };
  } catch (error) {
    return flowActionErrorState(error, "SAVE_FAILED", "Nie udało się zapisać procesu.");
  }
}

export async function publishFlowDraftRequestAction(input: unknown): Promise<FlowActionState> {
  const parsed = flowDraftRequestSchema.safeParse(input);
  if (!parsed.success) {
    return invalidFlowActionState();
  }
  try {
    const context = await requireTenantContext(parsed.data.organizationId);
    const revision = await saveFlowDraft(context, {
      document: parsed.data.document,
      expectedDraftRevision: parsed.data.expectedDraftRevision,
      flowId: parsed.data.flowId,
      name: parsed.data.name,
    });
    await publishFlowDraft(context, {
      expectedDraftRevision: revision,
      flowId: parsed.data.flowId,
    });
    revalidatePath(`/panel/${parsed.data.organizationId}/procesy`);
    revalidatePath(`/panel/${parsed.data.organizationId}/procesy/${parsed.data.flowId}`);
    return {
      code: null,
      error: null,
      revision,
      success: "Zapisano i opublikowano nową wersję.",
    };
  } catch (error) {
    return flowActionErrorState(error, "PUBLISH_FAILED", "Proces nie może zostać opublikowany.");
  }
}

function parseFlowForm(formData: FormData):
  | Readonly<{
      document: ReturnType<typeof flowDocumentSchema.parse>;
      expectedDraftRevision: number;
      flowId: string;
      name: string;
      organizationId: string;
      success: true;
    }>
  | Readonly<{ state: FlowActionState; success: false }> {
  try {
    const parsed = flowDraftRequestSchema.parse({
      document: JSON.parse(String(formData.get("document") ?? "")),
      expectedDraftRevision: Number(formData.get("expectedDraftRevision")),
      flowId: String(formData.get("flowId") ?? ""),
      name: String(formData.get("name") ?? ""),
      organizationId: String(formData.get("organizationId") ?? ""),
    });
    return {
      ...parsed,
      success: true,
    };
  } catch (error) {
    return {
      state: {
        code: "INVALID",
        error: error instanceof Error ? error.message : "Draft ma nieprawidłowy format.",
        revision: null,
        success: null,
      },
      success: false,
    };
  }
}

function invalidFlowActionState(): FlowActionState {
  return {
    code: "INVALID",
    error: "Dane zapisu procesu są nieprawidłowe.",
    revision: null,
    success: null,
  };
}

function flowActionErrorState(
  error: unknown,
  fallbackCode: Exclude<FlowActionCode, "CONFLICT" | "INVALID">,
  fallbackMessage: string,
): FlowActionState {
  if (error instanceof FlowDraftConflictError) {
    return {
      code: "CONFLICT",
      error: error.message,
      revision: null,
      success: null,
    };
  }
  return {
    code: fallbackCode,
    error: error instanceof Error ? error.message : fallbackMessage,
    revision: null,
    success: null,
  };
}
