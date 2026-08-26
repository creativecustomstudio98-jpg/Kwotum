import { AuthorizationError, createTenantContext } from "@wyceno/database";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.hoisted(() => vi.fn());

vi.mock("../supabase/server", () => ({ createClient: createClientMock }));

import { getLeadDetail, listLeadPage, normalizeLeadListSearch } from "./service";

type QueryResult = Readonly<{
  count?: number | null;
  data: readonly unknown[];
  error: null;
}>;

type AwaitableQuery = Readonly<{
  eq: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  or: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  then: Promise<QueryResult>["then"];
}>;

type DetailQueryResult = Readonly<{
  data: unknown;
  error: Readonly<{ message: string }> | null;
}>;

type DetailAwaitableQuery = Readonly<{
  eq: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  then: Promise<DetailQueryResult>["then"];
}>;

const organizationId = "10000000-0000-4000-8000-000000000001";
const leadId = "30000000-0000-4000-8000-000000000001";
const memberUserId = "20000000-0000-4000-8000-000000000002";
const ownerContext = createTenantContext({
  organizationId,
  role: "owner",
  status: "active",
  userId: "20000000-0000-4000-8000-000000000001",
});

function query(result: QueryResult): AwaitableQuery {
  const promise = Promise.resolve(result);
  const builder = {
    eq: vi.fn(),
    in: vi.fn(),
    or: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    select: vi.fn(),
    then: promise.then.bind(promise),
  } satisfies AwaitableQuery;
  builder.eq.mockReturnValue(builder);
  builder.in.mockReturnValue(builder);
  builder.or.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.range.mockReturnValue(builder);
  builder.select.mockReturnValue(builder);
  return builder;
}

function detailQuery(
  result: DetailQueryResult,
  rangeResult: DetailQueryResult = result,
): DetailAwaitableQuery {
  let currentResult = result;
  const builder = {
    eq: vi.fn(),
    in: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
    order: vi.fn(),
    range: vi.fn(),
    select: vi.fn(),
    then: ((onFulfilled, onRejected) =>
      Promise.resolve(currentResult).then(
        onFulfilled,
        onRejected,
      )) as Promise<DetailQueryResult>["then"],
  } satisfies DetailAwaitableQuery;
  builder.eq.mockReturnValue(builder);
  builder.in.mockReturnValue(builder);
  builder.limit.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.range.mockImplementation(() => {
    currentResult = rangeResult;
    return builder;
  });
  builder.select.mockReturnValue(builder);
  return builder;
}

function detailLeadRow() {
  return {
    contact_email: "klient@example.test",
    contact_name: "Klient testowy",
    contact_phone: "+48123000000",
    context_snapshot: null,
    estimation_explanation: null,
    flow_name: "kuchnia-na-wymiar",
    flow_title: "Kuchnia na wymiar",
    id: leadId,
    organization_id: organizationId,
    preferred_contact_channel: "email",
    preferred_contact_window: "afternoon",
    price_currency: "PLN",
    price_max_minor: 35_000_00,
    price_min_minor: 25_000_00,
    price_presentation: "25 000–35 000 zł",
    score: 80,
    score_category_label: "Dobry lead",
    status: "new",
    submitted_at: "2026-08-26T12:00:00.000Z",
  } as const;
}

const detailChildTables = [
  "lead_activity_events",
  "lead_answers",
  "consent_records",
  "lead_files",
  "lead_status_history",
  "organization_members",
  "lead_notes",
  "notifications",
  "lead_operations",
  "lead_tasks",
] as const;

const leadScopedDetailTables = detailChildTables.filter(
  (table) => table !== "organization_members",
);

function configureLeadDetail(
  input: Readonly<{
    activities?: readonly unknown[];
    activityRange?: readonly unknown[];
    files?: readonly unknown[];
    leadResult?: DetailQueryResult;
    members?: readonly unknown[];
    profiles?: readonly unknown[];
    taskRange?: readonly unknown[];
    tasks?: readonly unknown[];
  }> = {},
) {
  const resultByTable = new Map<string, DetailQueryResult>([
    ["leads", input.leadResult ?? { data: detailLeadRow(), error: null }],
    ["lead_activity_events", { data: input.activities ?? [], error: null }],
    ["lead_answers", { data: [], error: null }],
    ["consent_records", { data: [], error: null }],
    ["lead_files", { data: input.files ?? [], error: null }],
    ["lead_status_history", { data: [], error: null }],
    ["organization_members", { data: input.members ?? [], error: null }],
    ["lead_notes", { data: [], error: null }],
    ["notifications", { data: [], error: null }],
    ["lead_operations", { data: { assignee_user_id: null, priority: "medium" }, error: null }],
    ["lead_tasks", { data: input.tasks ?? [], error: null }],
    ["profiles", { data: input.profiles ?? [], error: null }],
  ]);
  const queryByTable = new Map(
    [...resultByTable].map(
      ([table, result]) =>
        [
          table,
          detailQuery(
            result,
            table === "lead_activity_events"
              ? { data: input.activityRange ?? result.data, error: null }
              : table === "lead_tasks"
                ? { data: input.taskRange ?? result.data, error: null }
                : result,
          ),
        ] as const,
    ),
  );
  const from = vi.fn((table: string) => {
    const tableQuery = queryByTable.get(table);
    if (!tableQuery) throw new Error(`Nieoczekiwana tabela testowa: ${table}`);
    return tableQuery;
  });
  const createSignedUrl = vi.fn(
    async (objectPath: string) =>
      ({ data: { signedUrl: `https://storage.example.test/${objectPath}` }, error: null }) as const,
  );
  const storageFrom = vi.fn(() => ({ createSignedUrl }));
  createClientMock.mockResolvedValue({ from, storage: { from: storageFrom } });

  return {
    createSignedUrl,
    from,
    queryFor(table: string) {
      const tableQuery = queryByTable.get(table);
      if (!tableQuery) throw new Error(`Brak zapytania testowego dla tabeli: ${table}`);
      return tableQuery;
    },
    storageFrom,
  };
}

function configureLeadList(
  input: Readonly<{
    answers?: readonly unknown[];
    count: number;
    leads: readonly unknown[];
  }>,
) {
  const countQuery = query({ count: input.count, data: [], error: null });
  const pageQuery = query({ data: input.leads, error: null });
  const answersQuery = query({ data: input.answers ?? [], error: null });
  let leadCall = 0;
  const from = vi.fn((table: string) => {
    if (table === "leads") {
      leadCall += 1;
      return leadCall === 1 ? countQuery : pageQuery;
    }
    if (table === "lead_answers") return answersQuery;
    throw new Error(`Nieoczekiwana tabela testowa: ${table}`);
  });
  createClientMock.mockResolvedValue({ from });
  return { answersQuery, countQuery, from, pageQuery };
}

function leadRow(index: number) {
  return {
    contact_email: `klient-${index}@example.test`,
    contact_name: `Klient ${index}`,
    contact_phone: `+4812300${String(index).padStart(4, "0")}`,
    flow_title: "Kuchnia na wymiar",
    id: `30000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    price_currency: "PLN",
    price_max_minor: 35_000_00,
    price_min_minor: 25_000_00,
    score: 80,
    score_category_label: "Dobry lead",
    status: "new",
    submitted_at: `2026-08-${String(Math.min(index, 26)).padStart(2, "0")}T12:00:00.000Z`,
  } as const;
}

describe("paginated lead service", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("returns a real empty state with a clamped page and no answer query", async () => {
    const fixture = configureLeadList({ count: 0, leads: [] });

    await expect(listLeadPage(ownerContext, { page: 9, pageSize: 8 })).resolves.toEqual({
      items: [],
      page: 1,
      pageCount: 1,
      total: 0,
    });
    expect(fixture.pageQuery.range).toHaveBeenCalledWith(0, 7);
    expect(fixture.countQuery.eq).toHaveBeenCalledWith("organization_id", organizationId);
    expect(fixture.pageQuery.eq).toHaveBeenCalledWith("organization_id", organizationId);
    expect(fixture.from).toHaveBeenCalledTimes(2);
  });

  it("maps one lead and fetches its timeline only inside the tenant", async () => {
    const lead = leadRow(1);
    const fixture = configureLeadList({
      answers: [{ answer: "Do 3 miesięcy", lead_id: lead.id }],
      count: 1,
      leads: [lead],
    });

    const result = await listLeadPage(ownerContext, { page: 1, pageSize: 8 });

    expect(result).toMatchObject({ page: 1, pageCount: 1, total: 1 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ id: lead.id, timelineLabel: "Do 3 miesięcy" });
    expect(fixture.answersQuery.eq).toHaveBeenCalledWith("organization_id", organizationId);
    expect(fixture.answersQuery.eq).toHaveBeenCalledWith("step_key", "termin");
    expect(fixture.answersQuery.in).toHaveBeenCalledWith("lead_id", [lead.id]);
  });

  it("clamps a 100+ collection and requests only the final server range", async () => {
    const lastPage = Array.from({ length: 6 }, (_, index) => leadRow(index + 97));
    const fixture = configureLeadList({ count: 102, leads: lastPage });

    const result = await listLeadPage(ownerContext, { page: 99, pageSize: 8 });

    expect(result).toMatchObject({ page: 13, pageCount: 13, total: 102 });
    expect(result.items).toHaveLength(6);
    expect(fixture.pageQuery.range).toHaveBeenCalledWith(96, 103);
    expect(fixture.pageQuery.order).toHaveBeenNthCalledWith(1, "submitted_at", {
      ascending: false,
    });
    expect(fixture.pageQuery.order).toHaveBeenNthCalledWith(2, "id", { ascending: true });
    expect(fixture.answersQuery.in).toHaveBeenCalledWith(
      "lead_id",
      lastPage.map((lead) => lead.id),
    );
  });

  it("sanitizes and limits the production search expression", () => {
    const raw = `  Anna%,_*(test)\\\u0000 Kowalska ${"x".repeat(100)}  `;
    const normalized = normalizeLeadListSearch(raw);

    expect(normalized).not.toMatch(/["\\,%_*()\u0000-\u001f]/);
    expect(normalized.length).toBeLessThanOrEqual(80);
    expect(normalized).toMatch(/^Anna test Kowalska/);
  });
});

describe("lead detail service", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("keeps a primary database failure distinct from a hidden resource", async () => {
    const fixture = configureLeadDetail({
      leadResult: { data: null, error: { message: "database unavailable" } },
    });

    const result = getLeadDetail(ownerContext, leadId);

    await expect(result).rejects.toThrow("Nie udało się pobrać szczegółów leada.");
    await expect(result).rejects.not.toBeInstanceOf(AuthorizationError);
    expect(fixture.queryFor("leads").eq).toHaveBeenCalledWith("id", leadId);
    expect(fixture.queryFor("leads").eq).toHaveBeenCalledWith("organization_id", organizationId);
    expect(fixture.from).toHaveBeenCalledTimes(1);
    expect(fixture.createSignedUrl).not.toHaveBeenCalled();
  });

  it("returns NOT_FOUND for a missing lead without starting child reads", async () => {
    const fixture = configureLeadDetail({ leadResult: { data: null, error: null } });

    await expect(getLeadDetail(ownerContext, leadId)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    expect(fixture.from).toHaveBeenCalledTimes(1);
    for (const table of detailChildTables) {
      expect(fixture.from).not.toHaveBeenCalledWith(table);
    }
    expect(fixture.storageFrom).not.toHaveBeenCalled();
  });

  it("scopes every tenant-owned detail read and allowlists profile ids from scoped rows", async () => {
    const fixture = configureLeadDetail({
      members: [{ role: "owner", user_id: memberUserId }],
      profiles: [{ display_name: "Opiekun", id: memberUserId }],
    });

    await expect(getLeadDetail(ownerContext, leadId)).resolves.toMatchObject({
      id: leadId,
      operation: {
        members: [{ name: "Opiekun", role: "owner", userId: memberUserId }],
      },
    });

    expect(fixture.queryFor("leads").eq).toHaveBeenCalledWith("id", leadId);
    expect(fixture.queryFor("leads").eq).toHaveBeenCalledWith("organization_id", organizationId);
    for (const table of detailChildTables) {
      expect(fixture.queryFor(table).eq).toHaveBeenCalledWith("organization_id", organizationId);
    }
    for (const table of leadScopedDetailTables) {
      expect(fixture.queryFor(table).eq).toHaveBeenCalledWith("lead_id", leadId);
    }
    expect(fixture.queryFor("profiles").in).toHaveBeenCalledWith("id", [memberUserId]);
  });

  it("creates a short signed URL only from the verified-file query", async () => {
    const objectPath = `${organizationId}/leads/${leadId}/verified-file.pdf`;
    const fixture = configureLeadDetail({
      files: [
        {
          id: "40000000-0000-4000-8000-000000000001",
          mime_type: "application/pdf",
          object_path: objectPath,
          original_name: "brief.pdf",
          size_bytes: 1024,
        },
      ],
    });

    const detail = await getLeadDetail(ownerContext, leadId);

    expect(fixture.queryFor("lead_files").eq).toHaveBeenCalledWith(
      "organization_id",
      organizationId,
    );
    expect(fixture.queryFor("lead_files").eq).toHaveBeenCalledWith("lead_id", leadId);
    expect(fixture.queryFor("lead_files").eq).toHaveBeenCalledWith("status", "verified");
    expect(fixture.storageFrom).toHaveBeenCalledWith("tenant-private");
    expect(fixture.createSignedUrl).toHaveBeenCalledOnce();
    expect(fixture.createSignedUrl).toHaveBeenCalledWith(objectPath, 60);
    expect(detail.files).toEqual([
      {
        downloadUrl: `https://storage.example.test/${objectPath}`,
        id: "40000000-0000-4000-8000-000000000001",
        mimeType: "application/pdf",
        name: "brief.pdf",
        sizeBytes: 1024,
      },
    ]);
  });

  it("loads activity and tasks beyond the first 100 rows without silently truncating history", async () => {
    const activities = Array.from({ length: 100 }, (_, index) => ({
      actor_user_id: memberUserId,
      from_value: "medium",
      id: `activity-${String(index).padStart(3, "0")}`,
      kind: "priority_changed",
      occurred_at: `2026-08-25T${String(index % 24).padStart(2, "0")}:00:00.000Z`,
      task_id: null,
      to_value: "high",
    }));
    const tasks = Array.from({ length: 100 }, (_, index) => ({
      assigned_to: memberUserId,
      closed_at: null,
      created_at: "2026-08-24T12:00:00.000Z",
      created_by: memberUserId,
      description: null,
      due_at: `2026-09-${String((index % 28) + 1).padStart(2, "0")}T12:00:00.000Z`,
      id: `task-${String(index).padStart(3, "0")}`,
      kind: "task",
      status: "open",
      title: `Działanie ${index + 1}`,
    }));
    const fixture = configureLeadDetail({
      activities,
      activityRange: [{ ...activities[0], id: "activity-100" }],
      members: [{ role: "owner", user_id: memberUserId }],
      profiles: [{ display_name: "Opiekun", id: memberUserId }],
      taskRange: [{ ...tasks[0], id: "task-100", title: "Działanie 101" }],
      tasks,
    });

    const detail = await getLeadDetail(ownerContext, leadId);

    expect(detail.operation.activities).toHaveLength(101);
    expect(detail.operation.tasks).toHaveLength(101);
    expect(fixture.queryFor("lead_activity_events").range).toHaveBeenCalledWith(100, 199);
    expect(fixture.queryFor("lead_tasks").range).toHaveBeenCalledWith(100, 199);
  });
});
