import { EmptyState } from "@wyceno/ui";
import type { Metadata } from "next";

import { requireTenantContext } from "../../../../../lib/auth/tenant-context";
import { getWebhookIntegration } from "../../../../../lib/webhooks/service";
import { PanelIcon } from "../../../panel-icon";
import { PanelPageHeader } from "../../../panel-page-header";
import { IntegrationsNavigation } from "../../integrations-navigation";
import { WebhookEndpointActions } from "./endpoint-actions";
import { WebhookEndpointForm } from "./endpoint-form";

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
  const { deliveries, endpoints, organizationName } = await getWebhookIntegration(organizationId);
  const activeEndpoints = endpoints.filter((endpoint) => endpoint.status === "enabled");
  const delivered = deliveries.filter((delivery) => delivery.status === "delivered").length;
  const requiresAttention = deliveries.filter(
    (delivery) => delivery.status === "dead_letter",
  ).length;

  return (
    <main className="panel-workspace webhook-panel">
      <PanelPageHeader
        breadcrumbs={[
          { href: `/panel/${organizationId}`, label: "Przegląd" },
          { label: "Integracje" },
        ]}
        description={`Bezpieczna wymiana zdarzeń organizacji ${organizationName}.`}
        navigation={<IntegrationsNavigation />}
        title="Integracje"
      />
      <div className="panel-page integrations-workspace">
        <div className="integrations-primary-grid">
          <section
            className="panel-card integration-summary"
            aria-labelledby="webhook-summary-title"
          >
            <div className="integration-row">
              <span className="integration-row__icon">
                <PanelIcon name="integration" />
              </span>
              <div>
                <h2 id="webhook-summary-title">
                  Webhook <code>lead.created</code>
                </h2>
                <p>Podpisane HMAC zdarzenie po utworzeniu leada, dostarczane co najmniej raz.</p>
              </div>
              <span
                className={`panel-status panel-status--${activeEndpoints.length > 0 ? "qualified" : "neutral"}`}
              >
                {activeEndpoints.length > 0
                  ? activeEndpointLabel(activeEndpoints.length)
                  : "Nie skonfigurowano"}
              </span>
            </div>
            <div className="integration-security-note">
              <PanelIcon name="privacy" />
              <span>
                Score, odpowiedzi, pliki i reguły nigdy nie opuszczają Kwotum. Sekret nie jest
                przechowywany w bazie.
              </span>
            </div>
            <dl className="webhook-summary-metrics">
              <div>
                <dt>Dostarczone</dt>
                <dd>{delivered}</dd>
              </div>
              <div>
                <dt>Wymaga uwagi</dt>
                <dd>{requiresAttention}</dd>
              </div>
            </dl>
          </section>
          <WebhookEndpointForm organizationId={organizationId} requestId={crypto.randomUUID()} />
        </div>

        <section className="panel-card integration-connections" aria-labelledby="endpoints-title">
          <div className="panel-card__header">
            <div>
              <h2 id="endpoints-title">Endpointy odbiorcze</h2>
              <p>Rotacja sekretu, syntetyczny test i wyłączenie są audytowane.</p>
            </div>
            <span className="panel-status panel-status--neutral">{endpoints.length} łącznie</span>
          </div>
          {endpoints.length === 0 ? (
            <EmptyState
              description="Dodaj publiczny URL HTTPS. DNS i wszystkie adresy IP zostaną sprawdzone przed zapisem."
              title="Brak webhooków"
            />
          ) : (
            <ul className="webhook-endpoint-list">
              {endpoints.map((endpoint) => (
                <li key={endpoint.id}>
                  <div className="webhook-endpoint-main">
                    <span className="integration-row__icon">
                      <PanelIcon name="external" />
                    </span>
                    <span>
                      <strong>{endpoint.url}</strong>
                      <small>
                        {endpoint.eventType} · sekret v{endpoint.secretVersion} · ostatnia dostawa{" "}
                        {formatDate(endpoint.lastDeliveredAt)}
                      </small>
                    </span>
                    <span
                      className={`panel-status panel-status--${endpoint.status === "enabled" ? "qualified" : "neutral"}`}
                    >
                      {endpoint.status === "enabled" ? "Aktywny" : "Wyłączony"}
                    </span>
                  </div>
                  {endpoint.status === "enabled" ? (
                    <div className="webhook-endpoint-controls">
                      <WebhookEndpointActions
                        endpointId={endpoint.id}
                        organizationId={organizationId}
                        rotateRequestId={crypto.randomUUID()}
                        testRequestId={crypto.randomUUID()}
                      />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel-card integration-connections" aria-labelledby="deliveries-title">
          <div className="panel-card__header">
            <div>
              <h2 id="deliveries-title">Historia dostaw</h2>
              <p>Bez payloadu, response body i danych osobowych w historii technicznej.</p>
            </div>
            <span className="panel-status panel-status--neutral">Ostatnie {deliveries.length}</span>
          </div>
          {deliveries.length === 0 ? (
            <EmptyState
              description="Po teście lub nowym leadzie zobaczysz tu status, liczbę prób i kod HTTP."
              title="Brak prób dostawy"
            />
          ) : (
            <ul className="webhook-delivery-list">
              {deliveries.map((delivery) => (
                <li key={delivery.id}>
                  <span>
                    <strong>{delivery.isTest ? "Test syntetyczny" : "Nowy lead"}</strong>
                    <small>
                      {delivery.eventId} · {formatDate(delivery.createdAt)}
                    </small>
                  </span>
                  <span>
                    {delivery.attemptCount} {delivery.attemptCount === 1 ? "próba" : "prób"}
                    {delivery.responseStatus ? ` · HTTP ${delivery.responseStatus}` : ""}
                  </span>
                  <span
                    className={`panel-status panel-status--${delivery.status === "delivered" ? "qualified" : delivery.status === "dead_letter" ? "warning" : "neutral"}`}
                  >
                    {deliveryLabels[delivery.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
