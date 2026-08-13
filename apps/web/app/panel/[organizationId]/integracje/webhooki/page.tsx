import { EmptyState } from "@wyceno/ui";
import type { Metadata } from "next";

import { requireTenantContext } from "../../../../../lib/auth/tenant-context";
import { getRecentWebhookDeliveries } from "../../../../../lib/webhooks/presentation";
import { getWebhookIntegration } from "../../../../../lib/webhooks/service";
import { IntegrationChannelNavigation } from "../../../integration-channel-navigation";
import { PanelIcon } from "../../../panel-icon";
import { PanelPageHeader } from "../../../panel-page-header";
import { WebhookEndpointActions } from "./endpoint-actions";
import { WebhookEndpointForm } from "./endpoint-form";
import { WebhookTestForm } from "./test-form";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Webhooki",
};

export const dynamic = "force-dynamic";

const deliveryLabels = {
  dead_letter: "Wymaga uwagi",
  delivered: "Dostarczono",
  pending: "Oczekuje",
  processing: "Wysyłanie",
  retry: "Ponowienie",
} as const;

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function endpointHost(value: string): string {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

function activeEndpointLabel(count: number): string {
  if (count === 1) return "1 aktywny";
  if (count >= 2 && count <= 4) return `${count} aktywne`;
  return `${count} aktywnych`;
}

export default async function WebhookIntegrationPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  await requireTenantContext(organizationId);
  const { deliveries, endpoints } = await getWebhookIntegration(organizationId);
  const activeEndpoints = endpoints.filter((endpoint) => endpoint.status === "enabled");
  const recentDeliveries = getRecentWebhookDeliveries(deliveries);
  const delivered24h = recentDeliveries.filter(
    (delivery) => delivery.status === "delivered",
  ).length;
  const deliveryRate =
    recentDeliveries.length === 0
      ? null
      : Math.round((delivered24h / recentDeliveries.length) * 100);
  const endpointUrls = new Map(endpoints.map((endpoint) => [endpoint.id, endpoint.url]));

  return (
    <main className="panel-workspace integrations-panel webhook-panel">
      <PanelPageHeader
        description="Przekazuj nowe leady do zewnętrznych systemów w czasie rzeczywistym."
        title="Webhooki"
      />
      <div className="panel-page integrations-workspace">
        <IntegrationChannelNavigation active="webhooks" organizationId={organizationId} />

        <section className="panel-card integration-overview" aria-label="Stan webhooków">
          <div className="integration-overview__item">
            <span className="integration-overview__icon">
              <PanelIcon name="bolt" />
            </span>
            <div>
              <span className="integration-overview__label">Zdarzenie</span>
              <strong>lead.created</strong>
              <small>Wysyłane po utworzeniu nowego leada.</small>
            </div>
            <span aria-hidden="true" className="integration-overview__state is-success">
              <PanelIcon name="check" />
            </span>
          </div>
          <div className="integration-overview__item">
            <span className="integration-overview__icon">
              <PanelIcon name="privacy" />
            </span>
            <div>
              <span className="integration-overview__label">Podpis</span>
              <strong>HMAC-SHA256</strong>
              <small>Każda próba jest podpisana i ma ochronę przed replay.</small>
            </div>
            <span aria-hidden="true" className="integration-overview__state is-success">
              <PanelIcon name="check" />
            </span>
          </div>
          <div className="integration-overview__item">
            <span className="integration-overview__icon">
              <PanelIcon name="globe" />
            </span>
            <div>
              <span className="integration-overview__label">Endpointy</span>
              <strong>{activeEndpoints.length}</strong>
              <small>
                {activeEndpointLabel(activeEndpoints.length)} z {endpoints.length} skonfigurowanych.
              </small>
            </div>
            <span
              aria-hidden="true"
              className={`integration-overview__state ${activeEndpoints.length > 0 ? "is-success" : "is-neutral"}`}
            >
              {activeEndpoints.length > 0 ? <PanelIcon name="check" /> : "—"}
            </span>
          </div>
          <div className="integration-overview__item">
            <span className="integration-overview__icon">
              <PanelIcon name="send" />
            </span>
            <div>
              <span className="integration-overview__label">Dostawa (24 h)</span>
              <strong>{deliveryRate === null ? "—" : `${deliveryRate}%`}</strong>
              <small>
                {recentDeliveries.length === 0
                  ? "Brak prób w ostatnich 24 godzinach."
                  : `${delivered24h} z ${recentDeliveries.length} dostarczonych.`}
              </small>
            </div>
            <span
              aria-hidden="true"
              className={`integration-overview__state ${deliveryRate === 100 ? "is-success" : deliveryRate === null ? "is-neutral" : "is-warning"}`}
            >
              {deliveryRate === 100 ? (
                <PanelIcon name="check" />
              ) : deliveryRate === null ? (
                "—"
              ) : (
                <PanelIcon name="warning" />
              )}
            </span>
          </div>
        </section>

        <div className="webhook-operations-grid">
          <section className="panel-card webhook-endpoints-card" aria-labelledby="endpoints-title">
            <div className="panel-card__header">
              <div>
                <h2 id="endpoints-title">Endpointy</h2>
                <p>Każdy odbiorca ma osobny sekret, testy i historię dostaw.</p>
              </div>
              <span className="panel-status panel-status--neutral">
                {activeEndpointLabel(activeEndpoints.length)}
              </span>
            </div>
            <WebhookEndpointForm organizationId={organizationId} requestId={crypto.randomUUID()} />
            {endpoints.length === 0 ? (
              <div className="integration-empty-state">
                <EmptyState
                  description="Dodaj publiczny URL HTTPS. DNS i wszystkie adresy IP zostaną sprawdzone przed zapisem."
                  title="Brak webhooków"
                />
              </div>
            ) : (
              <>
                <div className="webhook-endpoint-table-head" aria-hidden="true">
                  <span>Endpoint</span>
                  <span>Status</span>
                  <span>Ostatnia dostawa</span>
                  <span>Dostawy (24 h)</span>
                  <span>Akcje</span>
                </div>
                <ul className="webhook-endpoint-list">
                  {endpoints.map((endpoint) => {
                    const endpointRecent = recentDeliveries.filter(
                      (delivery) => delivery.endpointId === endpoint.id,
                    );
                    const endpointDelivered = endpointRecent.filter(
                      (delivery) => delivery.status === "delivered",
                    ).length;
                    return (
                      <li className="webhook-endpoint-row" key={endpoint.id}>
                        <div className="webhook-endpoint-identity">
                          <span className="integration-row__icon">
                            <PanelIcon name="external" />
                          </span>
                          <span>
                            <strong>{endpoint.url}</strong>
                            <small>
                              {endpoint.eventType} · sekret v{endpoint.secretVersion}
                            </small>
                          </span>
                        </div>
                        <span data-label="Status">
                          <span
                            className={`panel-status panel-status--${endpoint.status === "enabled" ? "qualified" : "neutral"}`}
                          >
                            {endpoint.status === "enabled" ? "Aktywny" : "Wyłączony"}
                          </span>
                        </span>
                        <span data-label="Ostatnia dostawa">
                          {formatDate(endpoint.lastDeliveredAt)}
                        </span>
                        <span data-label="Dostawy (24 h)">
                          {endpointRecent.length === 0
                            ? "—"
                            : `${endpointDelivered} / ${endpointRecent.length}`}
                        </span>
                        <div className="webhook-endpoint-controls" data-label="Akcje">
                          {endpoint.status === "enabled" ? (
                            <WebhookEndpointActions
                              endpointId={endpoint.id}
                              organizationId={organizationId}
                              rotateRequestId={crypto.randomUUID()}
                            />
                          ) : (
                            <span className="webhook-disabled-note">Brak dostępnych akcji</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </section>
          <WebhookTestForm
            endpoints={activeEndpoints.map((endpoint) => ({ id: endpoint.id, url: endpoint.url }))}
            organizationId={organizationId}
            requestId={crypto.randomUUID()}
          />
        </div>

        <section className="panel-card webhook-history-card" aria-labelledby="deliveries-title">
          <div className="panel-card__header">
            <div>
              <h2 id="deliveries-title">Historia dostaw</h2>
              <p>Ostatnie próby bez payloadu, response body i danych osobowych.</p>
            </div>
            <span className="panel-status panel-status--neutral">Ostatnie {deliveries.length}</span>
          </div>
          {deliveries.length === 0 ? (
            <div className="integration-empty-state">
              <EmptyState
                description="Po teście lub nowym leadzie zobaczysz tu status, liczbę prób i kod HTTP."
                title="Brak prób dostawy"
              />
            </div>
          ) : (
            <div className="webhook-history-table-wrap">
              <table className="webhook-history-table">
                <thead>
                  <tr>
                    <th scope="col">Czas</th>
                    <th scope="col">Endpoint</th>
                    <th scope="col">Zdarzenie</th>
                    <th scope="col">Status</th>
                    <th scope="col">Kod HTTP</th>
                    <th scope="col">Próba</th>
                    <th scope="col">ID dostawy</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id}>
                      <td data-label="Czas">{formatDate(delivery.createdAt)}</td>
                      <td data-label="Endpoint">
                        {endpointHost(endpointUrls.get(delivery.endpointId) ?? "Nieznany endpoint")}
                      </td>
                      <td data-label="Zdarzenie">
                        {delivery.isTest ? "Test syntetyczny" : "lead.created"}
                      </td>
                      <td data-label="Status">
                        <span
                          className={`webhook-delivery-status is-${delivery.status}`}
                          title={delivery.errorCode ?? undefined}
                        >
                          {deliveryLabels[delivery.status]}
                        </span>
                      </td>
                      <td data-label="Kod HTTP">
                        <span
                          className={`webhook-http-status ${delivery.responseStatus && delivery.responseStatus >= 400 ? "is-error" : ""}`}
                        >
                          {delivery.responseStatus ?? "—"}
                        </span>
                      </td>
                      <td data-label="Próba">{delivery.attemptCount} / 5</td>
                      <td data-label="ID dostawy">
                        <code>{delivery.id}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
