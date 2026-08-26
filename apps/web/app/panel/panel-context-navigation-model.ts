export type PanelContextNavigationItem = Readonly<{
  href: string;
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
    { href: `${organizationRoot}/ustawienia`, label: "Organizacja" },
    { href: `${organizationRoot}/powiadomienia`, label: "Powiadomienia" },
    ...(options.showPrivacy
      ? [{ href: `${organizationRoot}/prywatnosc`, label: "Dane i prywatność" }]
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
