import { hasCapability } from "@wyceno/database";
import type { Metadata } from "next";

import { requireTenantContext } from "../../../../lib/auth/tenant-context";
import { getOrganizationSettings } from "../../../../lib/organizations/service";
import { listFlowMediaAssets } from "../../../../lib/flows/media-assets";
import { PanelIcon } from "../../panel-icon";
import { PanelPageHeader } from "../../panel-page-header";
import { SettingsNavigation } from "../settings-navigation";
import { OrganizationForm } from "./organization-form";
import { NotificationDeliveryForm } from "./notification-delivery-form";
import { BrandingForm } from "./branding-form";

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
  const brandingAssets = hasCapability(context, "flow:read")
    ? await listFlowMediaAssets(context)
    : [];
  const canEdit = hasCapability(context, "organization:update");
  const canManageNotifications = hasCapability(context, "notification:manage");

  return (
    <main className="panel-workspace settings-panel">
      <PanelPageHeader
        breadcrumbs={[
          { href: `/panel/${organizationId}`, label: "Przegląd" },
          { label: "Ustawienia" },
        ]}
        description="Dane organizacji, branding i dostawa nowych leadów."
        navigation={<SettingsNavigation />}
        title="Ustawienia"
      />
      <div className="panel-page settings-page">
        <div className="settings-page__content">
          <section className="settings-section" aria-labelledby="company-data-title">
            <div className="settings-section__heading">
              <div>
                <h2 id="company-data-title">Dane organizacji</h2>
                <p>Informacje widoczne w panelu oraz tenantowych wiadomościach systemowych.</p>
              </div>
              <span className="panel-status panel-status--qualified">
                {canEdit ? "Owner" : "Tylko odczyt"}
              </span>
            </div>
            <div className="settings-surface">
              <OrganizationForm
                currentUserEmail={settings.currentUserEmail}
                editable={canEdit}
                name={settings.name}
                organizationId={organizationId}
                role={settings.role}
                slug={settings.slug}
              />
            </div>
          </section>
          <section className="settings-section" aria-labelledby="branding-title">
            <div className="settings-section__heading">
              <div>
                <h2 id="branding-title">Branding widżetu</h2>
                <p>Kontrolowana identyfikacja firmy bez własnego CSS, fontów ani skryptów.</p>
              </div>
              <span className="panel-status panel-status--qualified">Bezpieczny profil</span>
            </div>
            <div className="settings-surface settings-surface--branding">
              <BrandingForm
                accentColor={settings.brandAccentColor}
                assets={brandingAssets}
                displayName={settings.brandDisplayName}
                editable={canEdit}
                logoAssetId={settings.brandLogoAssetId}
                organizationId={organizationId}
                organizationName={settings.name}
              />
            </div>
          </section>
          {canManageNotifications ? (
            <section className="settings-section" aria-labelledby="lead-delivery-title">
              <div className="settings-section__heading">
                <div>
                  <h2 id="lead-delivery-title">Dostawa nowych leadów</h2>
                  <p>
                    Wiadomości trafiają na firmowy adres niezależnie od kont użytkowników panelu.
                  </p>
                </div>
                <span className="panel-status panel-status--qualified">Owner / Admin</span>
              </div>
              <div className="settings-surface">
                <NotificationDeliveryForm
                  leadAlertEmail={settings.leadAlertEmail}
                  organizationId={organizationId}
                />
              </div>
            </section>
          ) : null}
          <section className="settings-section" aria-labelledby="tenant-boundary-title">
            <div className="settings-section__heading">
              <div>
                <h2 id="tenant-boundary-title">Granica danych organizacji</h2>
                <p>
                  Procesy, leady, analityka i integracje są odczytywane wyłącznie w kontekście tej
                  organizacji.
                </p>
              </div>
            </div>
            <dl className="settings-surface settings-identity-card">
              <div className="settings-identity-card__item">
                <PanelIcon height={18} name="calendar" width={18} />
                <span>
                  <dt>Utworzono</dt>
                  <dd>{new Intl.DateTimeFormat("pl-PL").format(new Date(settings.createdAt))}</dd>
                </span>
              </div>
              <div className="settings-identity-card__item">
                <PanelIcon height={18} name="privacy" width={18} />
                <span>
                  <dt>Tenant ID</dt>
                  <dd>{organizationId}</dd>
                </span>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </main>
  );
}
