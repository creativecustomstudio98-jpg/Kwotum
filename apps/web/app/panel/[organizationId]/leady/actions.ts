"use server";

import type { LeadPriority, LeadStatus, LeadTaskKind } from "@wyceno/database";
import { z } from "zod";

import { requireTenantContext } from "../../../../lib/auth/tenant-context";
import {
  addLeadNote,
  changeLeadStatus,
  closeLeadTask,
  createLeadTask,
  setLeadAssignee,
  setLeadPriority,
} from "../../../../lib/leads/service";
import { leadStatuses } from "../../../../lib/leads/presentation";

export type LeadActionState = Readonly<{
  closedTaskId?: string;
  createdNote?: Readonly<{
    body: string;
    createdAt: string;
    createdBy: string;
    id: string;
  }>;
  createdTask?: Readonly<{
    assignedTo: string;
    createdAt: string;
    createdBy: string;
    description: string | null;
    dueAt: string;
    id: string;
    kind: LeadTaskKind;
    title: string;
  }>;
  error: string | null;
  success: string | null;
}>;

const idSchema = z.uuid();
const statusSchema = z.enum(leadStatuses as [LeadStatus, ...LeadStatus[]]);
const prioritySchema = z.enum(["low", "medium", "high"] satisfies [
  LeadPriority,
  ...LeadPriority[],
]);
const taskKindSchema = z.enum(["contact", "task"] satisfies [LeadTaskKind, ...LeadTaskKind[]]);
const closedTaskStatusSchema = z.enum(["completed", "cancelled"]);
const dueAtSchema = z.iso.datetime({ offset: true });

export async function changeLeadStatusAction(
  _previous: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const organizationId = idSchema.safeParse(formData.get("organizationId"));
  const leadId = idSchema.safeParse(formData.get("leadId"));
  const status = statusSchema.safeParse(formData.get("status"));
  if (!organizationId.success || !leadId.success || !status.success) {
    return { error: "Nieprawidłowa zmiana statusu.", success: null };
  }
  try {
    const context = await requireTenantContext(organizationId.data);
    await changeLeadStatus(context, { leadId: leadId.data, status: status.data });
    return { error: null, success: "Status został zapisany." };
  } catch {
    return { error: "Nie udało się zmienić statusu.", success: null };
  }
}

export async function setLeadAssigneeAction(
  _previous: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const organizationId = idSchema.safeParse(formData.get("organizationId"));
  const leadId = idSchema.safeParse(formData.get("leadId"));
  const rawAssignee = formData.get("assigneeUserId");
  const assigneeUserId =
    rawAssignee === "" ? { success: true as const, data: null } : idSchema.safeParse(rawAssignee);
  if (!organizationId.success || !leadId.success || !assigneeUserId.success) {
    return { error: "Nieprawidłowy właściciel leada.", success: null };
  }
  try {
    const context = await requireTenantContext(organizationId.data);
    await setLeadAssignee(context, {
      assigneeUserId: assigneeUserId.data,
      leadId: leadId.data,
    });
    return { error: null, success: "Właściciel został zapisany." };
  } catch {
    return { error: "Nie udało się zmienić właściciela.", success: null };
  }
}

export async function setLeadPriorityAction(
  _previous: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const organizationId = idSchema.safeParse(formData.get("organizationId"));
  const leadId = idSchema.safeParse(formData.get("leadId"));
  const priority = prioritySchema.safeParse(formData.get("priority"));
  if (!organizationId.success || !leadId.success || !priority.success) {
    return { error: "Nieprawidłowy priorytet leada.", success: null };
  }
  try {
    const context = await requireTenantContext(organizationId.data);
    await setLeadPriority(context, { leadId: leadId.data, priority: priority.data });
    return { error: null, success: "Priorytet został zapisany." };
  } catch {
    return { error: "Nie udało się zmienić priorytetu.", success: null };
  }
}

export async function createLeadTaskAction(
  _previous: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const organizationId = idSchema.safeParse(formData.get("organizationId"));
  const leadId = idSchema.safeParse(formData.get("leadId"));
  const requestId = idSchema.safeParse(formData.get("requestId"));
  const kind = taskKindSchema.safeParse(formData.get("kind"));
  const title = z.string().trim().min(2).max(160).safeParse(formData.get("title"));
  const rawDescription = formData.get("description");
  const description = z
    .string()
    .trim()
    .max(2000)
    .transform((value) => value || null)
    .safeParse(typeof rawDescription === "string" ? rawDescription : "");
  const dueAt = dueAtSchema.safeParse(formData.get("dueAt"));
  const rawAssignee = formData.get("assignedTo");
  const assignedTo =
    rawAssignee === "" ? { success: true as const, data: null } : idSchema.safeParse(rawAssignee);
  if (
    !organizationId.success ||
    !leadId.success ||
    !requestId.success ||
    !kind.success ||
    !title.success ||
    !description.success ||
    !dueAt.success ||
    !assignedTo.success ||
    Date.parse(dueAt.data) <= Date.now() - 5 * 60 * 1000
  ) {
    return { error: "Uzupełnij poprawnie nazwę, termin i osobę odpowiedzialną.", success: null };
  }
  try {
    const context = await requireTenantContext(organizationId.data);
    const createdTask = await createLeadTask(context, {
      assignedTo: assignedTo.data,
      description: description.data,
      dueAt: dueAt.data,
      kind: kind.data,
      leadId: leadId.data,
      requestId: requestId.data,
      title: title.data,
    });
    return {
      createdTask: {
        assignedTo: assignedTo.data ?? context.userId,
        createdAt: createdTask.createdAt,
        createdBy: context.userId,
        description: description.data,
        dueAt: dueAt.data,
        id: createdTask.id,
        kind: kind.data,
        title: title.data,
      },
      error: null,
      success:
        kind.data === "contact" ? "Kontakt został zaplanowany." : "Zadanie zostało utworzone.",
    };
  } catch {
    return { error: "Nie udało się zapisać działania.", success: null };
  }
}

export async function closeLeadTaskAction(
  _previous: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const organizationId = idSchema.safeParse(formData.get("organizationId"));
  const leadId = idSchema.safeParse(formData.get("leadId"));
  const taskId = idSchema.safeParse(formData.get("taskId"));
  const status = closedTaskStatusSchema.safeParse(formData.get("taskStatus"));
  if (!organizationId.success || !leadId.success || !taskId.success || !status.success) {
    return { error: "Nieprawidłowa zmiana zadania.", success: null };
  }
  try {
    const context = await requireTenantContext(organizationId.data);
    await closeLeadTask(context, { status: status.data, taskId: taskId.data });
    return {
      closedTaskId: taskId.data,
      error: null,
      success: status.data === "completed" ? "Zadanie zostało wykonane." : "Zadanie anulowano.",
    };
  } catch {
    return { error: "Nie udało się zamknąć zadania.", success: null };
  }
}

export async function addLeadNoteAction(
  _previous: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const organizationId = idSchema.safeParse(formData.get("organizationId"));
  const leadId = idSchema.safeParse(formData.get("leadId"));
  const body = z.string().trim().min(1).max(4000).safeParse(formData.get("body"));
  if (!organizationId.success || !leadId.success || !body.success) {
    return { error: "Notatka musi mieć od 1 do 4000 znaków.", success: null };
  }
  try {
    const context = await requireTenantContext(organizationId.data);
    const createdNote = await addLeadNote(context, { body: body.data, leadId: leadId.data });
    return {
      createdNote: {
        body: body.data,
        createdAt: createdNote.createdAt,
        createdBy: context.userId,
        id: createdNote.id,
      },
      error: null,
      success: "Notatka została dodana.",
    };
  } catch {
    return { error: "Nie udało się dodać notatki.", success: null };
  }
}
