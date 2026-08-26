import { AuthorizationError, createTenantContext } from "@wyceno/database";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.hoisted(() => vi.fn());

vi.mock("../supabase/server", () => ({ createClient: createClientMock }));

import { exportLeadPersonalData } from "./service";

const organizationId = "10000000-0000-4000-8000-000000000001";
const leadId = "30000000-0000-4000-8000-000000000001";
const ownerContext = createTenantContext({
  organizationId,
  role: "owner",
  status: "active",
  userId: "20000000-0000-4000-8000-000000000001",
});

describe("privacy export service", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("maps a hidden lead RPC response to NOT_FOUND", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "P0002", message: "Lead not found." },
    });
    createClientMock.mockResolvedValue({ rpc });

    const result = exportLeadPersonalData(ownerContext, leadId);

    await expect(result).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Resource not found.",
      name: "AuthorizationError",
    });
    await expect(result).rejects.toBeInstanceOf(AuthorizationError);
    expect(rpc).toHaveBeenCalledWith("export_lead_personal_data", {
      target_lead_id: leadId,
      target_organization_id: organizationId,
    });
  });

  it("maps an empty successful RPC response to NOT_FOUND", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    createClientMock.mockResolvedValue({ rpc });

    const result = exportLeadPersonalData(ownerContext, leadId);

    await expect(result).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Resource not found.",
      name: "AuthorizationError",
    });
    await expect(result).rejects.toBeInstanceOf(AuthorizationError);
  });

  it("keeps unrelated RPC failures as a generic export error", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "08006", message: "Database unavailable." },
    });
    createClientMock.mockResolvedValue({ rpc });

    const result = exportLeadPersonalData(ownerContext, leadId);

    await expect(result).rejects.toThrow("Nie udało się wyeksportować danych leada.");
    await expect(result).rejects.not.toBeInstanceOf(AuthorizationError);
  });
});
