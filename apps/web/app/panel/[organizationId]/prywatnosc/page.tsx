import { hasCapability } from "@wyceno/database";
import type { Metadata } from "next";

import { requireTenantContext } from "../../../../lib/auth/tenant-context";
import { getPrivacyPolicy } from "../../../../lib/privacy/service";
import { PanelPageHeader } from "../../panel-page-header";
import { SettingsNavigation } from "../settings-navigation";
import { RetentionForm } from "./retention-form";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Prywatność i retencja",
};
export const dynamic = "force-dynamic";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const context = await requireTenantContext(organizationId);
  const policy = await getPrivacyPolicy(context);
  return (
    <main className="panel-workspace privacy-panel">
      <PanelPageHeader eyebrow="Ustawienia" title="Dane i prywatność" />
      <div className="panel-page settings-page">
        <SettingsNavigation
          active="privacy"
          organizationId={organizationId}
          showPrivacy={hasCapability(context, "privacy:manage")}
        />
        <div className="settings-page__content">
          <section className="panel-card privacy-summary" aria-labelledby="privacy-summary-title">
            <div>
              <h2 id="privacy-summary-title">Polityka danych organizacji</h2>
              <p>
                Retencja jest domyślnie wyłączona. Blokada prawna zawsze wstrzymuje automatyczne i
                ręczne usunięcie.
              </p>
            </div>
            <span
              className={`panel-status panel-status--${
                policy.approvedAt ? "qualified" : "neutral"
              }`}
            >
              {policy.approvedAt ? "Aktywna" : "Nieaktywna"}
            </span>
          </section>
          <section className="panel-card" id="retention" aria-labelledby="retention-title">
            <div className="panel-card__header">
              <div>
                <h2 id="retention-title">Retencja leadów</h2>
                <p>
                  Aktywuj ją dopiero po zatwierdzeniu okresu przez administratora danych i prawnika.
                </p>
              </div>
            </div>
            <RetentionForm organizationId={organizationId} retentionDays={policy.retentionDays} />
            <p className="settings-form-status">
              Status:{" "}
              {policy.approvedAt
                ? `zatwierdzono ${new Intl.DateTimeFormat("pl-PL").format(
                    new Date(policy.approvedAt),
                  )}`
                : "brak aktywnej polityki"}
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
