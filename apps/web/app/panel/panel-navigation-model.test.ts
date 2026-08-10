import { describe, expect, it } from "vitest";

import {
  isMobilePanelDetailPath,
  isPanelNavigationItemActive,
  splitMobileNavigationItems,
  type PanelNavigationItem,
} from "./panel-navigation-model";

const organizationRoot = "/panel/00000000-0000-4000-8000-000000000001";

const items: PanelNavigationItem[] = [
  {
    href: organizationRoot,
    icon: "dashboard",
    label: "Dashboard",
    mobileLabel: "Start",
    mobilePlacement: "primary",
  },
  {
    href: `${organizationRoot}/leady`,
    icon: "leads",
    label: "Leady",
    mobilePlacement: "primary",
  },
  {
    href: `${organizationRoot}/szablony`,
    icon: "templates",
    label: "Szablony",
    mobilePlacement: "secondary",
  },
];

describe("panel navigation model", () => {
  it("keeps the organization root inactive on nested routes", () => {
    expect(isPanelNavigationItemActive(organizationRoot, organizationRoot, organizationRoot)).toBe(
      true,
    );
    expect(
      isPanelNavigationItemActive(`${organizationRoot}/leady`, organizationRoot, organizationRoot),
    ).toBe(false);
    expect(
      isPanelNavigationItemActive(
        `${organizationRoot}/leady/lead-1`,
        `${organizationRoot}/leady`,
        organizationRoot,
      ),
    ).toBe(true);
  });

  it("separates fixed mobile destinations from the More sheet", () => {
    expect(splitMobileNavigationItems(items)).toEqual({
      primary: items.slice(0, 2),
      secondary: items.slice(2),
    });
  });

  it("hides global mobile navigation on lead details and process workspaces", () => {
    expect(isMobilePanelDetailPath(`${organizationRoot}/leady/lead-1`, organizationRoot)).toBe(
      true,
    );
    expect(isMobilePanelDetailPath(`${organizationRoot}/procesy/flow-1`, organizationRoot)).toBe(
      true,
    );
    expect(
      isMobilePanelDetailPath(`${organizationRoot}/procesy/flow-1/instalacja`, organizationRoot),
    ).toBe(true);
    expect(isMobilePanelDetailPath(`${organizationRoot}/leady`, organizationRoot)).toBe(false);
    expect(isMobilePanelDetailPath(`${organizationRoot}/analityka`, organizationRoot)).toBe(false);
  });
});
