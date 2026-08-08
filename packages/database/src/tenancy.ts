import type { OrganizationMemberRole, OrganizationMemberStatus } from "./database.types";

export type Capability =
  | "analytics:read"
  | "analytics:summary"
  | "audit:read"
  | "flow:publish"
  | "flow:read"
  | "flow:share"
  | "flow:write"
  | "lead:assign"
  | "lead:note"
  | "lead:operate"
  | "lead:read"
  | "lead:status"
  | "member:manage"
  | "organization:delete"
  | "organization:read"
  | "organization:update"
  | "privacy:manage"
  | "storage:delete"
  | "storage:read"
  | "storage:write"
  | "wordpress:manage";

export type TenantContext = Readonly<{
  organizationId: string;
  role: OrganizationMemberRole;
  userId: string;
}>;

export type MembershipInput = Readonly<{
  organizationId: string;
  role: OrganizationMemberRole;
  status: OrganizationMemberStatus;
  userId: string;
}>;

export type AuthorizationErrorCode = "FORBIDDEN" | "MEMBERSHIP_INACTIVE" | "NOT_FOUND";

export class AuthorizationError extends Error {
  readonly code: AuthorizationErrorCode;

  constructor(code: AuthorizationErrorCode, message: string) {
    super(message);
    this.name = "AuthorizationError";
    this.code = code;
  }
}

const capabilitiesByRole = {
  owner: new Set<Capability>([
    "analytics:read",
    "analytics:summary",
    "audit:read",
    "flow:publish",
    "flow:read",
    "flow:share",
    "flow:write",
    "lead:assign",
    "lead:note",
    "lead:operate",
    "lead:read",
    "lead:status",
    "member:manage",
    "organization:delete",
    "organization:read",
    "organization:update",
    "privacy:manage",
    "storage:delete",
    "storage:read",
    "storage:write",
    "wordpress:manage",
  ]),
  admin: new Set<Capability>([
    "analytics:read",
    "analytics:summary",
    "audit:read",
    "flow:publish",
    "flow:read",
    "flow:share",
    "flow:write",
    "lead:assign",
    "lead:note",
    "lead:operate",
    "lead:read",
    "lead:status",
    "organization:read",
    "storage:delete",
    "storage:read",
    "storage:write",
    "wordpress:manage",
  ]),
  sales: new Set<Capability>([
    "analytics:summary",
    "lead:note",
    "lead:operate",
    "lead:read",
    "lead:status",
    "organization:read",
    "storage:read",
    "storage:write",
  ]),
} satisfies Record<OrganizationMemberRole, ReadonlySet<Capability>>;

export function createTenantContext(membership: MembershipInput): TenantContext {
  if (membership.status !== "active") {
    throw new AuthorizationError(
      "MEMBERSHIP_INACTIVE",
      "Active organization membership is required.",
    );
  }

  return Object.freeze({
    organizationId: membership.organizationId,
    role: membership.role,
    userId: membership.userId,
  });
}

export function hasCapability(context: TenantContext, capability: Capability): boolean {
  return capabilitiesByRole[context.role].has(capability);
}

export function assertCapability(context: TenantContext, capability: Capability): void {
  if (!hasCapability(context, capability)) {
    throw new AuthorizationError(
      "FORBIDDEN",
      "The current organization role cannot perform this operation.",
    );
  }
}

export function assertTenantResource(context: TenantContext, resourceOrganizationId: string): void {
  if (context.organizationId !== resourceOrganizationId) {
    throw new AuthorizationError("NOT_FOUND", "Resource not found.");
  }
}
