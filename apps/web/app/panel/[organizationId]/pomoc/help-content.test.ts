import { createTenantContext } from "@wyceno/database";
import { describe, expect, it } from "vitest";

import { filterHelpGuides, getAccessibleHelpGuides } from "./help-content";

const organizationId = "9f38fc31-7747-4b54-a690-41fd08125acc";

function contextFor(role: "admin" | "owner" | "sales") {
  return createTenantContext({
    organizationId,
    role,
    status: "active",
    userId: "6b4e1d31-ed8b-4f46-a3f1-6964f42a8247",
  });
}

describe("help content", () => {
  it("shows the owner every guide and keeps links inside the selected tenant", () => {
    const guides = getAccessibleHelpGuides(contextFor("owner"), organizationId);

    expect(guides.length).toBeGreaterThanOrEqual(18);
    expect(guides.some((guide) => guide.id === "webhooks")).toBe(true);
    expect(guides.some((guide) => guide.id === "privacy-retention")).toBe(true);
    expect(
      guides
        .filter((guide) => guide.href.startsWith("/panel/") && guide.href !== "/panel")
        .every((guide) => guide.href.startsWith(`/panel/${organizationId}`)),
    ).toBe(true);
  });

  it("does not disclose configuration guides unavailable to the sales role", () => {
    const guides = getAccessibleHelpGuides(contextFor("sales"), organizationId);
    const ids = guides.map((guide) => guide.id);

    expect(ids).toContain("lead-detail");
    expect(ids).toContain("analytics");
    expect(ids).toContain("troubleshooting");
    expect(ids).not.toContain("process-builder");
    expect(ids).not.toContain("webhooks");
    expect(ids).not.toContain("wordpress");
    expect(ids).not.toContain("privacy-retention");
  });

  it("searches titles, synonyms and instructions without requiring Polish diacritics", () => {
    const guides = getAccessibleHelpGuides(contextFor("owner"), organizationId);

    expect(filterHelpGuides(guides, "wordpress").map((guide) => guide.id)).toContain("wordpress");
    expect(filterHelpGuides(guides, "prywatnosc").map((guide) => guide.id)).toContain(
      "privacy-retention",
    );
    expect(filterHelpGuides(guides, "  ")).toEqual(guides);
  });
});
