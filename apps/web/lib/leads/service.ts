import {
  assertCapability,
  assertTenantResource,
  AuthorizationError,
  type Json,
  type LeadActivityKind,
  type LeadPriority,
  type LeadStatus,
  type LeadTaskKind,
  type LeadTaskStatus,
  type OrganizationMemberRole,
  type TenantContext,
} from "@wyceno/database";

import { createClient } from "../supabase/server";
import { deriveLeadOperationProjection } from "./operations";

export type LeadSummary = Readonly<{
  contactEmail: string | null;
  contactName: string | null;
  contactPhone: string | null;
  flowTitle: string;
  id: string;
  priceCurrency: string | null;
  priceMaxMinor: number | null;
  priceMinMinor: number | null;
  score: number | null;
  scoreCategoryLabel: string | null;
  status: LeadStatus;
  submittedAt: string;
  timelineLabel: string | null;
}>;

export type LeadListCounts = Readonly<{
  all: number;
  completed: number;
  inProgress: number;
  new: number;
  rejected: number;
}>;

export type LeadListPage = Readonly<{
  items: readonly LeadSummary[];
  page: number;
  pageCount: number;
  total: number;
}>;

export type DashboardAttention = Readonly<{
  count: number;
  items: ReadonlyArray<
    Readonly<{
      contactEmail: string | null;
      contactName: string | null;
      contactPhone: string | null;
      flowTitle: string;
      id: string;
      status: LeadStatus;
      submittedAt: string;
    }>
  >;
}>;

export type LeadDetail = Readonly<{
  answers: ReadonlyArray<Readonly<{ answer: Json; questionTitle: string; stepKey: string }>>;
  consents: ReadonlyArray<
    Readonly<{
      contentVersion: string;
      recordedAt: string;
      type: "marketing_email" | "privacy_notice";
    }>
  >;
  contactEmail: string | null;
  contactName: string | null;
  contactPhone: string | null;
  preferredContactChannel: "email" | "phone" | null;
  preferredContactWindow: "morning" | "afternoon" | "evening" | null;
  context: Readonly<{
    source: Readonly<{ kind: "embedded" | "hosted"; origin: string | null }>;
    values: ReadonlyArray<
      Readonly<{
        key: string;
        label: string;
        mode: "confirm" | "informational" | "system";
        value: string;
      }>
    >;
  }>;
  files: ReadonlyArray<
    Readonly<{
      downloadUrl: string | null;
      id: string;
      mimeType: string;
      name: string;
      sizeBytes: number;
    }>
  >;
  flowName: string;
  flowTitle: string;
  history: ReadonlyArray<
    Readonly<{
      changedAt: string;
      changedBy: string | null;
      fromStatus: LeadStatus | null;
      toStatus: LeadStatus;
    }>
  >;
  id: string;
  notes: ReadonlyArray<
    Readonly<{
      body: string;
      createdAt: string;
      createdBy: string;
      createdByName: string;
      id: string;
    }>
  >;
  notifications: ReadonlyArray<
    Readonly<{
      attemptCount: number;
      createdAt: string;
      kind: "lead_company_alert" | "lead_customer_confirmation";
      lastErrorCode: string | null;
      sentAt: string | null;
      status: "failed" | "pending" | "processing" | "retry" | "sent";
    }>
  >;
  operation: Readonly<{
    activities: ReadonlyArray<
      Readonly<{
        actorName: string;
        fromLabel: string | null;
        id: string;
        kind: LeadActivityKind;
        occurredAt: string;
        taskTitle: string | null;
        toLabel: string | null;
      }>
    >;
    assignee: Readonly<{ name: string; userId: string }> | null;
    lastActivityAt: string;
    members: ReadonlyArray<
      Readonly<{ name: string; role: OrganizationMemberRole; userId: string }>
    >;
    nextContact: LeadOperationTask | null;
    nextTask: LeadOperationTask | null;
    priority: LeadPriority;
    tasks: ReadonlyArray<LeadOperationTask>;
  }>;
  priceCurrency: string | null;
  priceMaxMinor: number | null;
  priceMinMinor: number | null;
  pricePresentation: string | null;
  score: number | null;
  scoreCategoryLabel: string | null;
  status: LeadStatus;
  submittedAt: string;
  triggeredScoringRules: ReadonlyArray<Readonly<{ id: string; label: string; points: number }>>;
}>;

export type LeadOperationTask = Readonly<{
  assignedTo: string | null;
  assignedToName: string;
  closedAt: string | null;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  description: string | null;
  dueAt: string;
  id: string;
  kind: LeadTaskKind;
  status: LeadTaskStatus;
  title: string;
}>;

export async function listLeads(
  context: TenantContext,
  status?: LeadStatus,
  limit = 100,
): Promise<LeadSummary[]> {
  assertCapability(context, "lead:read");
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("Nieprawidłowy limit listy leadów.");
  }
  const supabase = await createClient();
  let query = supabase
    .from("leads")
    .select(
      "id, contact_email, contact_name, contact_phone, flow_title, price_currency, price_max_minor, price_min_minor, score, score_category_label, status, submitted_at",
    )
    .eq("organization_id", context.organizationId)
    .order("submitted_at", { ascending: false })
    .limit(limit);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error("Nie udało się pobrać leadów.");
  const leadIds = data.map((lead) => lead.id);
  const timelineByLeadId = new Map<string, string>();
  if (leadIds.length > 0) {
    const { data: timelineAnswers, error: timelineError } = await supabase
      .from("lead_answers")
      .select("lead_id, display_answer")
      .eq("organization_id", context.organizationId)
      .eq("step_key", "termin")
      .in("lead_id", leadIds);
    if (timelineError) throw new Error("Nie udało się pobrać terminów leadów.");
    for (const timelineAnswer of timelineAnswers) {
      if (typeof timelineAnswer.display_answer === "string") {
        timelineByLeadId.set(timelineAnswer.lead_id, timelineAnswer.display_answer);
      }
    }
  }
  return data.map((lead) => ({
    contactEmail: lead.contact_email,
    contactName: lead.contact_name,
    contactPhone: lead.contact_phone,
    flowTitle: lead.flow_title,
    id: lead.id,
    priceCurrency: lead.price_currency,
    priceMaxMinor: lead.price_max_minor,
    priceMinMinor: lead.price_min_minor,
    score: lead.score,
    scoreCategoryLabel: lead.score_category_label,
    status: lead.status,
    submittedAt: lead.submitted_at,
    timelineLabel: timelineByLeadId.get(lead.id) ?? null,
  }));
}

export async function listLeadPage(
  context: TenantContext,
  input: Readonly<{
    page: number;
    pageSize: number;
    search?: string | undefined;
    statuses?: readonly LeadStatus[] | undefined;
  }>,
): Promise<LeadListPage> {
  assertCapability(context, "lead:read");
  if (!Number.isSafeInteger(input.page) || input.page < 1) {
    throw new Error("Nieprawidłowy numer strony leadów.");
  }
  if (!Number.isSafeInteger(input.pageSize) || input.pageSize < 1 || input.pageSize > 50) {
    throw new Error("Nieprawidłowy rozmiar strony leadów.");
  }

  const search = normalizeLeadListSearch(input.search ?? "");
  const statuses = [...new Set(input.statuses ?? [])];
  const supabase = await createClient();
  let countQuery = supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", context.organizationId);
  if (statuses.length === 1) countQuery = countQuery.eq("status", statuses[0]!);
  if (statuses.length > 1) countQuery = countQuery.in("status", statuses);
  if (search) countQuery = countQuery.or(leadSearchFilter(search));
  const countResult = await countQuery;
  if (countResult.error) throw new Error("Nie udało się pobrać leadów.");

  const total = countResult.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / input.pageSize));
  const page = Math.min(input.page, pageCount);
  const from = (page - 1) * input.pageSize;
  let pageQuery = supabase
    .from("leads")
    .select(
      "id, contact_email, contact_name, contact_phone, flow_title, price_currency, price_max_minor, price_min_minor, score, score_category_label, status, submitted_at",
    )
    .eq("organization_id", context.organizationId);
  if (statuses.length === 1) pageQuery = pageQuery.eq("status", statuses[0]!);
  if (statuses.length > 1) pageQuery = pageQuery.in("status", statuses);
  if (search) pageQuery = pageQuery.or(leadSearchFilter(search));
  const pageResult = await pageQuery
    .order("submitted_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, from + input.pageSize - 1);
  if (pageResult.error) throw new Error("Nie udało się pobrać leadów.");

  const leadIds = pageResult.data.map((lead) => lead.id);
  const timelineByLeadId = new Map<string, string>();
  if (leadIds.length > 0) {
    const timelineResult = await supabase
      .from("lead_answers")
      .select("lead_id, answer")
      .eq("organization_id", context.organizationId)
      .eq("step_key", "termin")
      .in("lead_id", leadIds);
    if (timelineResult.error) throw new Error("Nie udało się pobrać terminów leadów.");
    for (const timelineAnswer of timelineResult.data) {
      if (typeof timelineAnswer.answer === "string") {
        timelineByLeadId.set(timelineAnswer.lead_id, timelineAnswer.answer);
      }
    }
  }

  return {
    items: pageResult.data.map((lead) => ({
      contactEmail: lead.contact_email,
      contactName: lead.contact_name,
      contactPhone: lead.contact_phone,
      flowTitle: lead.flow_title,
      id: lead.id,
      priceCurrency: lead.price_currency,
      priceMaxMinor: lead.price_max_minor,
      priceMinMinor: lead.price_min_minor,
      score: lead.score,
      scoreCategoryLabel: lead.score_category_label,
      status: lead.status,
      submittedAt: lead.submitted_at,
      timelineLabel: timelineByLeadId.get(lead.id) ?? null,
    })),
    page,
    pageCount,
    total,
  };
}

export async function getLeadListCounts(context: TenantContext): Promise<LeadListCounts> {
  assertCapability(context, "lead:read");
  const supabase = await createClient();
  const baseCount = () =>
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", context.organizationId);
  const [all, newLeads, inProgress, completed, rejected] = await Promise.all([
    baseCount(),
    baseCount().eq("status", "new"),
    baseCount().eq("status", "in_progress"),
    baseCount().in("status", ["qualified", "won"]),
    baseCount().in("status", ["lost", "spam"]),
  ]);
  if (all.error || newLeads.error || inProgress.error || completed.error || rejected.error) {
    throw new Error("Nie udało się pobrać liczników leadów.");
  }
  return {
    all: all.count ?? 0,
    completed: completed.count ?? 0,
    inProgress: inProgress.count ?? 0,
    new: newLeads.count ?? 0,
    rejected: rejected.count ?? 0,
  };
}

export function normalizeLeadListSearch(value: string): string {
  return value
    .trim()
    .slice(0, 80)
    .replace(/["\\,%_*()\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function leadSearchFilter(search: string): string {
  const pattern = `*${search}*`;
  return ["contact_name", "contact_email", "contact_phone", "flow_title"]
    .map((field) => `${field}.ilike.${pattern}`)
    .join(",");
}

export async function getDashboardAttention(
  context: TenantContext,
  now = new Date(),
): Promise<DashboardAttention> {
  assertCapability(context, "lead:read");
  if (!Number.isFinite(now.getTime())) throw new Error("Nieprawidłowa data dashboardu.");

  const supabase = await createClient();
  const staleBefore = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1_000).toISOString();
  const fields =
    "id, contact_email, contact_name, contact_phone, flow_title, status, submitted_at" as const;
  const [newResult, staleResult] = await Promise.all([
    supabase
      .from("leads")
      .select(fields, { count: "exact" })
      .eq("organization_id", context.organizationId)
      .eq("status", "new")
      .order("submitted_at", { ascending: false })
      .limit(3),
    supabase
      .from("leads")
      .select(fields, { count: "exact" })
      .eq("organization_id", context.organizationId)
      .eq("status", "in_progress")
      .lt("submitted_at", staleBefore)
      .order("submitted_at", { ascending: false })
      .limit(3),
  ]);

  if (newResult.error || staleResult.error) {
    throw new Error("Nie udało się pobrać leadów wymagających uwagi.");
  }

  const items = [...newResult.data, ...staleResult.data]
    .sort(
      (left, right) =>
        new Date(right.submitted_at).getTime() - new Date(left.submitted_at).getTime() ||
        right.id.localeCompare(left.id),
    )
    .slice(0, 3)
    .map((lead) => ({
      contactEmail: lead.contact_email,
      contactName: lead.contact_name,
      contactPhone: lead.contact_phone,
      flowTitle: lead.flow_title,
      id: lead.id,
      status: lead.status,
      submittedAt: lead.submitted_at,
    }));

  return {
    count:
      (newResult.count ?? newResult.data.length) + (staleResult.count ?? staleResult.data.length),
    items,
  };
}

function scoringRules(explanation: Json | null): LeadDetail["triggeredScoringRules"] {
  if (
    !explanation ||
    typeof explanation !== "object" ||
    Array.isArray(explanation) ||
    !explanation.scoring ||
    typeof explanation.scoring !== "object" ||
    Array.isArray(explanation.scoring) ||
    !Array.isArray(explanation.scoring.triggeredRules)
  ) {
    return [];
  }
  return explanation.scoring.triggeredRules.flatMap((rule) => {
    if (
      !rule ||
      typeof rule !== "object" ||
      Array.isArray(rule) ||
      typeof rule.id !== "string" ||
      typeof rule.label !== "string" ||
      typeof rule.points !== "number"
    ) {
      return [];
    }
    return [{ id: rule.id, label: rule.label, points: rule.points }];
  });
}

function leadContext(snapshot: Json): LeadDetail["context"] {
  const empty = { source: { kind: "hosted" as const, origin: null }, values: [] };
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return empty;
  const source = snapshot.source;
  const values = snapshot.values;
  if (!source || typeof source !== "object" || Array.isArray(source) || !Array.isArray(values)) {
    return empty;
  }
  const kind = source.kind === "embedded" ? "embedded" : "hosted";
  const origin = typeof source.origin === "string" ? source.origin : null;
  return {
    source: { kind, origin },
    values: values.flatMap((entry) => {
      if (
        !entry ||
        typeof entry !== "object" ||
        Array.isArray(entry) ||
        typeof entry.key !== "string" ||
        typeof entry.label !== "string" ||
        typeof entry.value !== "string" ||
        !["confirm", "informational", "system"].includes(String(entry.mode))
      ) {
        return [];
      }
      return [
        {
          key: entry.key,
          label: entry.label,
          mode: entry.mode as "confirm" | "informational" | "system",
          value: entry.value,
        },
      ];
    }),
  };
}

export async function getLeadDetail(context: TenantContext, leadId: string): Promise<LeadDetail> {
  assertCapability(context, "lead:read");
  const supabase = await createClient();
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select(
      "id, organization_id, contact_email, contact_name, contact_phone, preferred_contact_channel, preferred_contact_window, context_snapshot, flow_name, flow_title, status, score, score_category_label, price_min_minor, price_max_minor, price_currency, price_presentation, estimation_explanation, submitted_at",
    )
    .eq("id", leadId)
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  if (leadError) throw new Error("Nie udało się pobrać szczegółów leada.");
  if (!lead) throw new AuthorizationError("NOT_FOUND", "Resource not found.");
  assertTenantResource(context, lead.organization_id);

  const [
    activityResult,
    answersResult,
    consentsResult,
    filesResult,
    historyResult,
    membersResult,
    notesResult,
    notificationsResult,
    operationResult,
    tasksResult,
  ] = await Promise.all([
    supabase
      .from("lead_activity_events")
      .select("id, task_id, kind, actor_user_id, from_value, to_value, occurred_at")
      .eq("organization_id", context.organizationId)
      .eq("lead_id", leadId)
      .order("occurred_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(100),
    supabase
      .from("lead_answers")
      .select("step_key, question_title, display_answer")
      .eq("organization_id", context.organizationId)
      .eq("lead_id", leadId)
      .order("created_at"),
    supabase
      .from("consent_records")
      .select("type, content_version, recorded_at")
      .eq("organization_id", context.organizationId)
      .eq("lead_id", leadId)
      .order("recorded_at"),
    supabase
      .from("lead_files")
      .select("id, original_name, mime_type, size_bytes, object_path")
      .eq("organization_id", context.organizationId)
      .eq("lead_id", leadId)
      .eq("status", "verified")
      .order("created_at"),
    supabase
      .from("lead_status_history")
      .select("from_status, to_status, changed_by, changed_at")
      .eq("organization_id", context.organizationId)
      .eq("lead_id", leadId)
      .order("changed_at", { ascending: false }),
    supabase
      .from("organization_members")
      .select("user_id, role")
      .eq("organization_id", context.organizationId)
      .eq("status", "active")
      .order("created_at"),
    supabase
      .from("lead_notes")
      .select("id, body, created_by, created_at")
      .eq("organization_id", context.organizationId)
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false }),
    supabase
      .from("notifications")
      .select("kind, status, attempt_count, created_at, sent_at, last_error_code")
      .eq("organization_id", context.organizationId)
      .eq("lead_id", leadId)
      .order("created_at"),
    supabase
      .from("lead_operations")
      .select("assignee_user_id, priority")
      .eq("organization_id", context.organizationId)
      .eq("lead_id", leadId)
      .maybeSingle(),
    supabase
      .from("lead_tasks")
      .select(
        "id, kind, title, description, due_at, assigned_to, created_by, status, closed_at, created_at",
      )
      .eq("organization_id", context.organizationId)
      .eq("lead_id", leadId)
      .order("due_at")
      .order("id")
      .limit(100),
  ]);
  if (
    activityResult.error ||
    answersResult.error ||
    consentsResult.error ||
    filesResult.error ||
    historyResult.error ||
    membersResult.error ||
    notesResult.error ||
    notificationsResult.error ||
    operationResult.error ||
    !operationResult.data ||
    tasksResult.error
  ) {
    throw new Error("Nie udało się pobrać szczegółów leada.");
  }
  let activityRows = [...activityResult.data];
  let taskRows = [...tasksResult.data];
  const detailPageSize = 100;
  let activityOffset = detailPageSize;
  let taskOffset = detailPageSize;

  while (activityRows.length === activityOffset) {
    const nextActivityResult = await supabase
      .from("lead_activity_events")
      .select("id, task_id, kind, actor_user_id, from_value, to_value, occurred_at")
      .eq("organization_id", context.organizationId)
      .eq("lead_id", leadId)
      .order("occurred_at", { ascending: false })
      .order("id", { ascending: false })
      .range(activityOffset, activityOffset + detailPageSize - 1);
    if (nextActivityResult.error) {
      throw new Error("Nie udało się pobrać szczegółów leada.");
    }
    activityRows = [...activityRows, ...nextActivityResult.data];
    if (nextActivityResult.data.length < detailPageSize) break;
    activityOffset += detailPageSize;
  }

  while (taskRows.length === taskOffset) {
    const nextTaskResult = await supabase
      .from("lead_tasks")
      .select(
        "id, kind, title, description, due_at, assigned_to, created_by, status, closed_at, created_at",
      )
      .eq("organization_id", context.organizationId)
      .eq("lead_id", leadId)
      .order("due_at")
      .order("id")
      .range(taskOffset, taskOffset + detailPageSize - 1);
    if (nextTaskResult.error) {
      throw new Error("Nie udało się pobrać szczegółów leada.");
    }
    taskRows = [...taskRows, ...nextTaskResult.data];
    if (nextTaskResult.data.length < detailPageSize) break;
    taskOffset += detailPageSize;
  }

  const files = await Promise.all(
    filesResult.data.map(async (file) => {
      const { data } = await supabase.storage
        .from("tenant-private")
        .createSignedUrl(file.object_path, 60);
      return {
        downloadUrl: data?.signedUrl ?? null,
        id: file.id,
        mimeType: file.mime_type,
        name: file.original_name,
        sizeBytes: file.size_bytes,
      };
    }),
  );
  const profileIds = [
    operationResult.data.assignee_user_id,
    ...membersResult.data.map((member) => member.user_id),
    ...notesResult.data.map((note) => note.created_by),
    ...taskRows.flatMap((task) => [task.assigned_to, task.created_by]),
    ...activityRows.map((activity) => activity.actor_user_id),
    ...activityRows.flatMap((activity) =>
      activity.kind === "assignee_changed" ? [activity.from_value, activity.to_value] : [],
    ),
  ].filter((value): value is string => Boolean(value));
  const profileNames = new Map<string, string>();
  if (profileIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", [...new Set(profileIds)]);
    if (profilesError) throw new Error("Nie udało się pobrać danych zespołu.");
    profiles.forEach((profile) => {
      if (profile.display_name) profileNames.set(profile.id, profile.display_name);
    });
  }
  const displayName = (userId: string | null): string =>
    (userId ? profileNames.get(userId) : null) ?? "Użytkownik zespołu";
  const tasks: LeadOperationTask[] = taskRows.map((task) => ({
    assignedTo: task.assigned_to,
    assignedToName: task.assigned_to ? displayName(task.assigned_to) : "Nieprzypisany",
    closedAt: task.closed_at,
    createdAt: task.created_at,
    createdBy: task.created_by,
    createdByName: displayName(task.created_by),
    description: task.description,
    dueAt: task.due_at,
    id: task.id,
    kind: task.kind,
    status: task.status,
    title: task.title,
  }));
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const projection = deriveLeadOperationProjection({
    activityOccurredAts: activityRows.map((activity) => activity.occurred_at),
    noteCreatedAts: notesResult.data.map((note) => note.created_at),
    statusChangedAts: historyResult.data.map((entry) => entry.changed_at),
    submittedAt: lead.submitted_at,
    tasks,
  });

  return {
    answers: answersResult.data.map((answer) => ({
      answer: answer.display_answer,
      questionTitle: answer.question_title,
      stepKey: answer.step_key,
    })),
    consents: consentsResult.data.map((consent) => ({
      contentVersion: consent.content_version,
      recordedAt: consent.recorded_at,
      type: consent.type,
    })),
    contactEmail: lead.contact_email,
    contactName: lead.contact_name,
    contactPhone: lead.contact_phone,
    preferredContactChannel: lead.preferred_contact_channel,
    preferredContactWindow: lead.preferred_contact_window,
    context: leadContext(lead.context_snapshot),
    files,
    flowName: lead.flow_name,
    flowTitle: lead.flow_title,
    history: historyResult.data.map((entry) => ({
      changedAt: entry.changed_at,
      changedBy: entry.changed_by,
      fromStatus: entry.from_status,
      toStatus: entry.to_status,
    })),
    id: lead.id,
    notes: notesResult.data.map((note) => ({
      body: note.body,
      createdAt: note.created_at,
      createdBy: note.created_by,
      createdByName: displayName(note.created_by),
      id: note.id,
    })),
    notifications: notificationsResult.data.map((notification) => ({
      attemptCount: notification.attempt_count,
      createdAt: notification.created_at,
      kind: notification.kind,
      lastErrorCode: notification.last_error_code,
      sentAt: notification.sent_at,
      status: notification.status,
    })),
    operation: {
      activities: activityRows.map((activity) => ({
        actorName: displayName(activity.actor_user_id),
        fromLabel:
          activity.kind === "assignee_changed"
            ? activity.from_value
              ? displayName(activity.from_value)
              : "Bez właściciela"
            : activity.from_value,
        id: activity.id,
        kind: activity.kind,
        occurredAt: activity.occurred_at,
        taskTitle: activity.task_id ? (taskById.get(activity.task_id)?.title ?? null) : null,
        toLabel:
          activity.kind === "assignee_changed"
            ? activity.to_value
              ? displayName(activity.to_value)
              : "Bez właściciela"
            : activity.to_value,
      })),
      assignee: operationResult.data.assignee_user_id
        ? {
            name: displayName(operationResult.data.assignee_user_id),
            userId: operationResult.data.assignee_user_id,
          }
        : null,
      lastActivityAt: projection.lastActivityAt,
      members: membersResult.data.map((member) => ({
        name: displayName(member.user_id),
        role: member.role,
        userId: member.user_id,
      })),
      nextContact: projection.nextContactTaskId
        ? (taskById.get(projection.nextContactTaskId) ?? null)
        : null,
      nextTask: projection.nextTaskId ? (taskById.get(projection.nextTaskId) ?? null) : null,
      priority: operationResult.data.priority,
      tasks,
    },
    priceCurrency: lead.price_currency,
    priceMaxMinor: lead.price_max_minor,
    priceMinMinor: lead.price_min_minor,
    pricePresentation: lead.price_presentation,
    score: lead.score,
    scoreCategoryLabel: lead.score_category_label,
    status: lead.status,
    submittedAt: lead.submitted_at,
    triggeredScoringRules: scoringRules(lead.estimation_explanation),
  };
}

export async function addLeadNote(
  context: TenantContext,
  input: Readonly<{ body: string; leadId: string }>,
): Promise<Readonly<{ createdAt: string; id: string }>> {
  assertCapability(context, "lead:note");
  const body = input.body.trim();
  if (body.length < 1 || body.length > 4000) throw new Error("Notatka ma nieprawidłową długość.");
  await getLeadDetail(context, input.leadId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_notes")
    .insert({
      body,
      created_by: context.userId,
      lead_id: input.leadId,
      organization_id: context.organizationId,
    })
    .select("created_at, id")
    .single();
  if (error || !data) throw new Error("Nie udało się dodać notatki.");
  return { createdAt: data.created_at, id: data.id };
}

export async function changeLeadStatus(
  context: TenantContext,
  input: Readonly<{ leadId: string; status: LeadStatus }>,
): Promise<void> {
  assertCapability(context, "lead:status");
  const supabase = await createClient();
  const { error } = await supabase.rpc("change_lead_status", {
    target_lead_id: input.leadId,
    target_organization_id: context.organizationId,
    target_status: input.status,
  });
  if (error) throw new AuthorizationError("NOT_FOUND", "Resource not found.");
}

export async function setLeadAssignee(
  context: TenantContext,
  input: Readonly<{ assigneeUserId: string | null; leadId: string }>,
): Promise<void> {
  assertCapability(context, "lead:assign");
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_lead_assignee", {
    target_assignee_user_id: input.assigneeUserId,
    target_lead_id: input.leadId,
    target_organization_id: context.organizationId,
  });
  if (error) throw new AuthorizationError("NOT_FOUND", "Resource not found.");
}

export async function setLeadPriority(
  context: TenantContext,
  input: Readonly<{ leadId: string; priority: LeadPriority }>,
): Promise<void> {
  assertCapability(context, "lead:operate");
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_lead_priority", {
    target_lead_id: input.leadId,
    target_organization_id: context.organizationId,
    target_priority: input.priority,
  });
  if (error) throw new AuthorizationError("NOT_FOUND", "Resource not found.");
}

export async function createLeadTask(
  context: TenantContext,
  input: Readonly<{
    assignedTo: string | null;
    description: string | null;
    dueAt: string;
    kind: LeadTaskKind;
    leadId: string;
    requestId: string;
    title: string;
  }>,
): Promise<Readonly<{ createdAt: string; id: string }>> {
  assertCapability(context, "lead:operate");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_lead_task", {
    idempotency_key: input.requestId,
    target_assignee_user_id: input.assignedTo,
    target_description: input.description,
    target_due_at: input.dueAt,
    target_kind: input.kind,
    target_lead_id: input.leadId,
    target_organization_id: context.organizationId,
    target_title: input.title,
  });
  if (error) throw new AuthorizationError("NOT_FOUND", "Resource not found.");
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Nieprawidłowa odpowiedź po utworzeniu działania.");
  }
  const id = data.id;
  const createdAt = data.createdAt;
  if (typeof id !== "string" || typeof createdAt !== "string") {
    throw new Error("Nieprawidłowa odpowiedź po utworzeniu działania.");
  }
  return { createdAt, id };
}

export async function closeLeadTask(
  context: TenantContext,
  input: Readonly<{ status: "cancelled" | "completed"; taskId: string }>,
): Promise<void> {
  assertCapability(context, "lead:operate");
  const supabase = await createClient();
  const { error } = await supabase.rpc("close_lead_task", {
    target_organization_id: context.organizationId,
    target_status: input.status,
    target_task_id: input.taskId,
  });
  if (error) throw new AuthorizationError("NOT_FOUND", "Resource not found.");
}
