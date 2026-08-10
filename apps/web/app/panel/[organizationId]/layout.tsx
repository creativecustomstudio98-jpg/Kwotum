import { hasCapability } from "@wyceno/database";
import type { ReactNode } from "react";

import { requireTenantContext } from "../../../lib/auth/tenant-context";
import { createClient } from "../../../lib/supabase/server";
import { PanelNavigation } from "../panel-navigation";

export default async function OrganizationPanelLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ organizationId: string }>;
}>) {
  const { organizationId } = await params;
  const context = await requireTenantContext(organizationId);
  const supabase = await createClient();
  const [{ data: organization }, { data: profile }] = await Promise.all([
    supabase.from("organizations").select("name").eq("id", organizationId).maybeSingle(),
    supabase.from("profiles").select("display_name").eq("id", context.userId).maybeSingle(),
  ]);

  const items = [
    {
      href: `/panel/${organizationId}`,
      icon: "dashboard" as const,
      label: "Dashboard",
      mobileLabel: "Start",
      mobilePlacement: "primary" as const,
    },
    {
      href: `/panel/${organizationId}/leady`,
      icon: "leads" as const,
      label: "Leady",
      mobilePlacement: "primary" as const,
    },
    ...(hasCapability(context, "flow:read")
      ? [
          {
            href: `/panel/${organizationId}/procesy`,
            icon: "processes" as const,
            label: "Procesy",
            mobilePlacement: "primary" as const,
          },
          {
            href: `/panel/${organizationId}/szablony`,
            icon: "templates" as const,
            label: "Szablony",
            mobilePlacement: "secondary" as const,
          },
        ]
      : []),
    {
      href: `/panel/${organizationId}/analityka`,
      icon: "analytics" as const,
      label: "Analityka",
      mobilePlacement: "primary" as const,
    },
    ...(hasCapability(context, "wordpress:manage")
      ? [
          {
            href: `/panel/${organizationId}/integracje/wordpress`,
            icon: "integration" as const,
            label: "Integracje",
            mobilePlacement: "secondary" as const,
          },
        ]
      : []),
    ...(hasCapability(context, "privacy:manage")
      ? [
          {
            href: `/panel/${organizationId}/ustawienia`,
            icon: "settings" as const,
            label: "Ustawienia",
            mobilePlacement: "secondary" as const,
          },
        ]
      : []),
  ];

  return (
    <div className="panel-app-shell wy-panel-theme">
      <PanelNavigation
        items={items}
        notificationsHref={`/panel/${organizationId}/powiadomienia`}
        organizationName={organization?.name ?? "Organizacja"}
        userName={profile?.display_name ?? organization?.name ?? "Użytkownik"}
      />
      <div className="panel-app-content">{children}</div>
    </div>
  );
}
