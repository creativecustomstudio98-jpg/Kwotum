import { hasCapability } from "@wyceno/database";
import type { Metadata } from "next";

import { requireTenantContext } from "../../../../lib/auth/tenant-context";
import { getNotificationActivity } from "../../../../lib/notifications/activity";
import { PanelIcon } from "../../panel-icon";
import { PanelPageHeader } from "../../panel-page-header";
import { SettingsNavigation } from "../settings-navigation";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Powiadomienia",
};

export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  params,
}: Readonly<{
  params: Promise<{ organizationId: string }>;
}>) {
  const { organizationId } = await params;
  const context = await requireTenantContext(organizationId);
  const activity = await getNotificationActivity(context);

  return (
    <main className="panel-workspace settings-panel notifications-panel">
      <PanelPageHeader eyebrow={activity.organizationName} title="Powiadomienia" />
      <div className="panel-page settings-page">
        <SettingsNavigation
          active="notifications"
          organizationId={organizationId}
          showPrivacy={hasCapability(context, "privacy:manage")}
        />
        <div className="settings-page__content">
          <section className="panel-card notification-rules" aria-labelledby="delivery-rules-title">
            <div className="panel-card__header">
              <div>
                <h2 id="delivery-rules-title">Reguły dostawy</h2>
                <p>Wysyłki transakcyjne uruchamiane po bezpiecznym zapisaniu leada.</p>
              </div>
              <span className="panel-status panel-status--qualified">Aktywne</span>
            </div>
            <ul>
              <li>
                <span className="integration-row__icon">
                  <PanelIcon name="notification" />
                </span>
                <span>
                  <strong>Nowy lead dla firmy</strong>
                  <small>Alert trafia do aktywnego właściciela organizacji.</small>
                </span>
                <span className="panel-status panel-status--qualified">Systemowe</span>
              </li>
              <li>
                <span className="integration-row__icon">
                  <PanelIcon name="email" />
                </span>
                <span>
                  <strong>Potwierdzenie dla klienta</strong>
                  <small>Wiadomość jest wysyłana na zweryfikowany adres z formularza.</small>
                </span>
                <span className="panel-status panel-status--qualified">Systemowe</span>
              </li>
            </ul>
          </section>

          <dl className="notification-summary" aria-label="Dostawy z ostatnich 30 dni">
            <div>
              <dt>Dostarczone</dt>
              <dd>
                <strong>{activity.summary.sent}</strong>
                <small>ostatnie 30 dni</small>
              </dd>
            </div>
            <div>
              <dt>W kolejce</dt>
              <dd>
                <strong>{activity.summary.pending}</strong>
                <small>pending, retry lub processing</small>
              </dd>
            </div>
            <div>
              <dt>Wymagają uwagi</dt>
              <dd>
                <strong>{activity.summary.failed}</strong>
                <small>trwale zakończone błędem</small>
              </dd>
            </div>
          </dl>

          <section
            className="panel-card notification-deliveries"
            aria-labelledby="deliveries-title"
          >
            <div className="panel-card__header">
              <div>
                <h2 id="deliveries-title">Ostatnie dostawy</h2>
                <p>Adresy odbiorców są maskowane w widoku operacyjnym.</p>
              </div>
            </div>
            {activity.items.length === 0 ? (
              <div className="panel-inline-state">
                <strong>Brak dostaw w ostatnich 30 dniach</strong>
                <span>Pierwsze wpisy pojawią się po wysłaniu nowego zapytania.</span>
              </div>
            ) : (
              <div
                aria-label="Tabela ostatnich dostaw"
                className="notification-table-wrap"
                role="region"
                tabIndex={0}
              >
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Zdarzenie</th>
                      <th scope="col">Odbiorca</th>
                      <th scope="col">Status</th>
                      <th scope="col">Próby</th>
                      <th scope="col">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {item.kind === "lead_company_alert"
                            ? "Nowy lead dla firmy"
                            : "Potwierdzenie klienta"}
                        </td>
                        <td>{item.recipient}</td>
                        <td>
                          <span className={`panel-status panel-status--${statusTone(item.status)}`}>
                            {statusLabel(item.status)}
                          </span>
                          {item.errorCode ? <small>{errorLabel(item.errorCode)}</small> : null}
                        </td>
                        <td>{item.attemptCount}</td>
                        <td>
                          <time dateTime={item.sentAt ?? item.createdAt}>
                            {new Intl.DateTimeFormat("pl-PL", {
                              dateStyle: "short",
                              timeStyle: "short",
                            }).format(new Date(item.sentAt ?? item.createdAt))}
                          </time>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function statusTone(status: string): "neutral" | "qualified" | "waiting" {
  if (status === "sent") return "qualified";
  if (status === "failed") return "waiting";
  return "neutral";
}

function statusLabel(status: string): string {
  if (status === "sent") return "Dostarczono";
  if (status === "failed") return "Błąd";
  if (status === "retry") return "Ponowienie";
  if (status === "processing") return "Wysyłanie";
  return "W kolejce";
}

function errorLabel(code: string): string {
  if (code === "recipient_unavailable") return "Brak odbiorcy";
  if (code === "configuration") return "Konfiguracja";
  if (code === "network") return "Sieć";
  return "Dostawca";
}
