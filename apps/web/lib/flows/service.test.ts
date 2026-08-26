import { createTenantContext } from "@wyceno/database";
import { flowTemplates } from "@wyceno/validation";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.hoisted(() => vi.fn());

vi.mock("../supabase/server", () => ({ createClient: createClientMock }));

import { createFlowFromTemplate, listFlowDraftPage } from "./service";

type QueryResult = Readonly<{
  count?: number | null;
  data: readonly unknown[];
  error: null;
}>;

type AwaitableQuery = Readonly<{
  eq: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  then: Promise<QueryResult>["then"];
}>;

const organizationId = "10000000-0000-4000-8000-000000000001";
const userId = "20000000-0000-4000-8000-000000000001";
const ownerContext = createTenantContext({
  organizationId,
  role: "owner",
  status: "active",
  userId,
});
const salesContext = createTenantContext({
  organizationId,
  role: "sales",
  status: "active",
  userId,
});

function query(result: QueryResult): AwaitableQuery {
  const promise = Promise.resolve(result);
  const builder = {
    eq: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    select: vi.fn(),
    then: promise.then.bind(promise),
  } satisfies AwaitableQuery;
  builder.eq.mockReturnValue(builder);
  builder.in.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.range.mockReturnValue(builder);
  builder.select.mockReturnValue(builder);
  return builder;
}

function configureFlowList(
  input: Readonly<{
    count: number;
    flows: readonly unknown[];
    versions?: readonly unknown[];
  }>,
) {
  const countQuery = query({ count: input.count, data: [], error: null });
  const flowsQuery = query({ data: input.flows, error: null });
  const versionsQuery = query({ data: input.versions ?? [], error: null });
  let flowCall = 0;
  const from = vi.fn((table: string) => {
    if (table === "flows") {
      flowCall += 1;
      return flowCall === 1 ? countQuery : flowsQuery;
    }
    if (table === "flow_versions") return versionsQuery;
    throw new Error(`Nieoczekiwana tabela testowa: ${table}`);
  });
  createClientMock.mockResolvedValue({ from });
  return { countQuery, flowsQuery, from, versionsQuery };
}

function flowRow(index: number) {
  const template = flowTemplates[0];
  if (!template) throw new Error("Brak szablonu testowego.");
  return {
    draft: template.snapshot,
    draft_revision: index,
    id: `30000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    name: `Proces ${index}`,
    slug: `proces-${index}`,
    updated_at: `2026-08-${String(Math.min(index, 26)).padStart(2, "0")}T12:00:00.000Z`,
  };
}

describe("paginated flow service", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("returns the real empty state without querying versions", async () => {
    const fixture = configureFlowList({ count: 0, flows: [] });

    await expect(listFlowDraftPage(ownerContext, { page: 9, pageSize: 12 })).resolves.toEqual({
      items: [],
      page: 1,
      pageCount: 1,
      total: 0,
    });
    expect(fixture.flowsQuery.range).toHaveBeenCalledWith(0, 11);
    expect(fixture.from).toHaveBeenCalledTimes(2);
  });

  it("maps one process and only its newest on-page published version", async () => {
    const flow = flowRow(1);
    const fixture = configureFlowList({
      count: 1,
      flows: [flow],
      versions: [
        {
          flow_id: flow.id,
          published_at: "2026-08-26T12:00:00.000Z",
          version_number: 4,
        },
        {
          flow_id: flow.id,
          published_at: "2026-08-20T12:00:00.000Z",
          version_number: 2,
        },
        {
          flow_id: "30000000-0000-4000-8000-000000000099",
          published_at: "2026-08-27T12:00:00.000Z",
          version_number: 9,
        },
      ],
    });

    const result = await listFlowDraftPage(ownerContext, { page: 1, pageSize: 12 });

    expect(result).toMatchObject({ page: 1, pageCount: 1, total: 1 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ latestPublishedVersion: 4, status: "published" });
    expect(fixture.countQuery.eq).toHaveBeenCalledWith("organization_id", organizationId);
    expect(fixture.flowsQuery.eq).toHaveBeenCalledWith("organization_id", organizationId);
    expect(fixture.versionsQuery.eq).toHaveBeenCalledWith("organization_id", organizationId);
    expect(fixture.versionsQuery.eq).toHaveBeenCalledWith("status", "published");
    expect(fixture.versionsQuery.in).toHaveBeenCalledWith("flow_id", [flow.id]);
  });

  it("clamps a 100+ collection and requests only the final server range", async () => {
    const lastFlow = flowRow(109);
    const fixture = configureFlowList({ count: 109, flows: [lastFlow], versions: [] });

    const result = await listFlowDraftPage(ownerContext, { page: 99, pageSize: 12 });

    expect(result).toMatchObject({ page: 10, pageCount: 10, total: 109 });
    expect(result.items).toHaveLength(1);
    expect(fixture.flowsQuery.range).toHaveBeenCalledWith(108, 119);
    expect(fixture.versionsQuery.in).toHaveBeenCalledWith("flow_id", [lastFlow.id]);
  });

  it("rejects Sales reads and template writes before opening a data client", async () => {
    const template = flowTemplates[0];
    if (!template) throw new Error("Brak szablonu testowego.");

    await expect(listFlowDraftPage(salesContext, { page: 1, pageSize: 12 })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(
      createFlowFromTemplate(salesContext, { templateSlug: template.slug }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("derives name, document and slug from the canonical server template", async () => {
    const template = flowTemplates[0];
    if (!template) throw new Error("Brak szablonu testowego.");
    const single = vi.fn().mockResolvedValue({
      data: {
        draft_revision: 1,
        id: "40000000-0000-4000-8000-000000000001",
        name: template.name,
        organization_id: organizationId,
        slug: `${template.slug}-12345678`,
      },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    createClientMock.mockResolvedValue({ from: vi.fn().mockReturnValue({ insert }) });

    await createFlowFromTemplate(ownerContext, { templateSlug: template.slug });

    const payload = insert.mock.calls[0]?.[0] as Readonly<Record<string, unknown>> | undefined;
    expect(payload).toMatchObject({
      created_by: userId,
      draft: template.snapshot,
      name: template.name,
      organization_id: organizationId,
      updated_by: userId,
    });
    expect(payload?.slug).toEqual(
      expect.stringMatching(new RegExp(`^${template.slug}-[a-f0-9]{8}$`)),
    );
  });
});
