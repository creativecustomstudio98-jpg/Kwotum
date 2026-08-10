import type { PanelIconName } from "./panel-icon";

export type PanelNavigationItem = {
  href: string;
  icon: PanelIconName;
  label: string;
  mobileLabel?: string;
  mobilePlacement: "primary" | "secondary";
};

export function isPanelNavigationItemActive(
  pathname: string,
  href: string,
  organizationRoot: string,
): boolean {
  return pathname === href || (href !== organizationRoot && pathname.startsWith(`${href}/`));
}

export function isMobilePanelDetailPath(pathname: string, organizationRoot: string): boolean {
  const relativePath = pathname.startsWith(organizationRoot)
    ? pathname.slice(organizationRoot.length)
    : "";
  const segments = relativePath.split("/").filter(Boolean);

  return (
    (segments[0] === "leady" && segments.length > 1) ||
    (segments[0] === "procesy" && segments.length > 1)
  );
}

export function splitMobileNavigationItems(items: ReadonlyArray<PanelNavigationItem>): {
  primary: PanelNavigationItem[];
  secondary: PanelNavigationItem[];
} {
  return {
    primary: items.filter((item) => item.mobilePlacement === "primary"),
    secondary: items.filter((item) => item.mobilePlacement === "secondary"),
  };
}
