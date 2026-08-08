import {
  assertCapability,
  assertTenantResource,
  AuthorizationError,
  createTenantContext,
  hasCapability,
} from "./tenancy";
import { describe, expect, it } from "vitest";

const activeOwner = createTenantContext({
  organizationId: "organization-a",
  role: "owner",
  status: "active",
  userId: "user-a",
});

describe("tenant authorization", () => {
  it("grants owner-only capabilities only to an owner", () => {
    const sales = createTenantContext({
      organizationId: "organization-a",
      role: "sales",
      status: "active",
      userId: "user-b",
    });

    expect(hasCapability(activeOwner, "member:manage")).toBe(true);
    expect(hasCapability(activeOwner, "flow:share")).toBe(true);
    expect(hasCapability(activeOwner, "lead:assign")).toBe(true);
    expect(hasCapability(activeOwner, "lead:operate")).toBe(true);
    expect(hasCapability(sales, "member:manage")).toBe(false);
    expect(hasCapability(sales, "flow:share")).toBe(false);
    expect(hasCapability(sales, "lead:assign")).toBe(false);
    expect(hasCapability(sales, "lead:operate")).toBe(true);
    expect(hasCapability(sales, "flow:read")).toBe(false);
    expect(hasCapability(sales, "analytics:summary")).toBe(true);
    expect(hasCapability(sales, "analytics:read")).toBe(false);
    expect(() => assertCapability(sales, "member:manage")).toThrow(AuthorizationError);
  });

  it("rejects suspended and invited memberships", () => {
    for (const status of ["invited", "suspended"] as const) {
      expect(() =>
        createTenantContext({
          organizationId: "organization-a",
          role: "sales",
          status,
          userId: "user-b",
        }),
      ).toThrow(expect.objectContaining({ code: "MEMBERSHIP_INACTIVE" }));
    }
  });

  it("hides cross-tenant resource existence", () => {
    expect(() => assertTenantResource(activeOwner, "organization-b")).toThrow(
      expect.objectContaining({ code: "NOT_FOUND" }),
    );
  });
});
