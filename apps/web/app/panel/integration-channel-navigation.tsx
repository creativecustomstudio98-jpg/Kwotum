import Link from "next/link";

type IntegrationChannel = "webhooks" | "wordpress";

export function IntegrationChannelNavigation({
  active,
  organizationId,
}: Readonly<{
  active: IntegrationChannel;
  organizationId: string;
}>) {
  const channels = [
    {
      href: `/panel/${organizationId}/integracje/webhooki`,
      id: "webhooks",
      label: "Webhooki",
    },
    {
      href: `/panel/${organizationId}/integracje/wordpress`,
      id: "wordpress",
      label: "WordPress",
    },
  ] as const;

  return (
    <nav aria-label="Kanały integracji" className="integration-channel-navigation">
      {channels.map((channel) => (
        <Link
          aria-current={active === channel.id ? "page" : undefined}
          href={channel.href}
          key={channel.id}
        >
          {channel.label}
        </Link>
      ))}
    </nav>
  );
}
