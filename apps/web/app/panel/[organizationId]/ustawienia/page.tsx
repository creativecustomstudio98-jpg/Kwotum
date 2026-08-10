import { hasCapability } from "@wyceno/database";
import type { Metadata } from "next";

import { requireTenantContext } from "../../../../lib/auth/tenant-context";
import { getOrganizationSettings } from "../../../../lib/organizations/service";
import { PanelPageHeader } from "../../panel-page-header";
import { SettingsNavigation } from "../settings-navigation";
import { OrganizationForm } from "./organization-form";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Ustawienia organizacji",
};

export const dynamic = "force-dynamic";

export default async function OrganizationSettingsPage({
  params,
}: Readonly<{
  params: Promise<{ organizationId: string }>;
}>) {
  const { organizationId } = await params;
  const context = await requireTenantContext(organizationId);
  const settings = await getOrganizationSettings(context);
  const canEdit = hasCapability(context, "organization:update");

  return (
    <main className="panel-workspace settings-panel">
      <PanelPageHeader eyebrow={settings.name} title="Ustawienia organizacji" />
      <div className="panel-page settings-page">
        <SettingsNavigation
          active="organization"
          organizationId={organizationId}
          showPrivacy={hasCapability(context, "privacy:manage")}
        />
        <div className="settings-page__content">
          <section className="panel-card settings-detail-card" aria-labelledby="company-data-title">
            <div className="panel-card__header settings-detail-card__heading">
              <div>
                <h2 id="company-data-title">Dane organizacji</h2>
                <p>Informacje widoczne w panelu oraz tenantowych wiadomościach systemowych.</p>
              </div>
              <span className="panel-status panel-status--qualified">
                {canEdit ? "Owner" : "Tylko odczyt"}
              </span>
            </div>
            <OrganizationForm
              currentUserEmail={settings.currentUserEmail}
              editable={canEdit}
              name={settings.name}
              organizationId={organizationId}
              role={settings.role}
              slug={settings.slug}
            />
          </section>
          <section className="panel-card settings-identity-card">
            <div>
              <h2>Granica danych organizacji</h2>
              <p>
                Procesy, leady, analityka i integracje są zawsze odczytywane w kontekście tej
                organizacji.
              </p>
            </div>
            <dl>
              <div>
                <dt>Utworzono</dt>
                <dd>{new Intl.DateTimeFormat("pl-PL").format(new Date(settings.createdAt))}</dd>
              </div>
              <div>
                <dt>Tenant ID</dt>
                <dd>{organizationId}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </main>
  );
}
