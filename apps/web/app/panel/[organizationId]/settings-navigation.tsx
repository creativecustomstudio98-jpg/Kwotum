import Link from "next/link";

import { PanelIcon } from "../panel-icon";

type SettingsSection = "notifications" | "organization" | "privacy";

export function SettingsNavigation({
  active,
  organizationId,
  showPrivacy,
}: Readonly<{
  active: SettingsSection;
  organizationId: string;
  showPrivacy: boolean;
}>) {
  const links = [
    {
      href: `/panel/${organizationId}/ustawienia`,
      icon: "settings" as const,
      key: "organization" as const,
      label: "Organizacja",
    },
    {
      href: `/panel/${organizationId}/powiadomienia`,
      icon: "notification" as const,
      key: "notifications" as const,
      label: "Powiadomienia",
    },
    ...(showPrivacy
      ? [
          {
            href: `/panel/${organizationId}/prywatnosc`,
            icon: "privacy" as const,
            key: "privacy" as const,
            label: "Dane i prywatność",
          },
        ]
      : []),
  ];

  return (
    <nav aria-label="Kategorie ustawień" className="settings-page__nav">
      <strong>Ustawienia</strong>
      {links.map((link) => (
        <Link
          aria-current={link.key === active ? "page" : undefined}
          href={link.href}
          key={link.key}
        >
          <PanelIcon name={link.icon} />
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
