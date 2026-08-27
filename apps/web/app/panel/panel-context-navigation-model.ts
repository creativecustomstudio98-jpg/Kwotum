import type { PanelIconName } from "./panel-icon";

export type PanelContextNavigationItem = Readonly<{
  href: string;
  icon?: PanelIconName;
  label: string;
}>;

export function isPanelContextNavigationItemActive(pathname: string, href: string): boolean {
  return normalizePath(pathname) === normalizePath(href);
}

export function settingsNavigationItems(
  organizationId: string,
  options: Readonly<{ showPrivacy: boolean }>,
): PanelContextNavigationItem[] {
  const organizationRoot = `/panel/${organizationId}`;

  return [
    { href: `${organizationRoot}/ustawienia`, icon: "settings", label: "Organizacja" },
    {
      href: `${organizationRoot}/powiadomienia`,
      icon: "notification",
      label: "Powiadomienia",
    },
    ...(options.showPrivacy
      ? [
          {
            href: `${organizationRoot}/prywatnosc`,
            icon: "privacy" as const,
            label: "Dane i prywatność",
          },
        ]
      : []),
  ];
}

export function integrationsNavigationItems(
  organizationId: string,
  options: Readonly<{ showWebhooks: boolean; showWordPress: boolean }>,
): PanelContextNavigationItem[] {
  const organizationRoot = `/panel/${organizationId}`;

  return [
    ...(options.showWordPress
      ? [{ href: `${organizationRoot}/integracje/wordpress`, label: "WordPress" }]
      : []),
    ...(options.showWebhooks
      ? [{ href: `${organizationRoot}/integracje/webhooki`, label: "Webhooki" }]
      : []),
  ];
}

function normalizePath(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}
