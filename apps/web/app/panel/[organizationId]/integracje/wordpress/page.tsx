import { Button, EmptyState } from "@wyceno/ui";
import type { Metadata } from "next";

import { requireTenantContext } from "../../../../../lib/auth/tenant-context";
import { getWordPressIntegration } from "../../../../../lib/wordpress/service";
import { IntegrationChannelNavigation } from "../../../integration-channel-navigation";
import { PanelIcon } from "../../../panel-icon";
import { PanelPageHeader } from "../../../panel-page-header";
import { revokeWordPressConnectionAction } from "./actions";
import { WordPressTokenForm } from "./token-form";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Integracja WordPress",
};

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function WordPressIntegrationPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  await requireTenantContext(organizationId);
  const { connections } = await getWordPressIntegration(organizationId);
  const activeConnections = connections.filter((connection) => !connection.revokedAt);
  const latestHeartbeat = activeConnections.reduce<string | null>((latest, connection) => {
    if (!latest) return connection.lastSeenAt;
    return new Date(connection.lastSeenAt) > new Date(latest) ? connection.lastSeenAt : latest;
  }, null);

  return (
    <main className="panel-workspace integrations-panel wordpress-panel">
      <PanelPageHeader
        description="Połącz witryny WordPress z opublikowanymi procesami Kwotum."
        title="WordPress"
      />
      <div className="panel-page integrations-workspace">
        <IntegrationChannelNavigation active="wordpress" organizationId={organizationId} />

        <section className="panel-card integration-overview" aria-label="Stan integracji WordPress">
          <div className="integration-overview__item">
            <span className="integration-overview__icon">
              <PanelIcon name="globe" />
            </span>
            <div>
              <span className="integration-overview__label">Połączone strony</span>
              <strong>{activeConnections.length}</strong>
              <small>
                {activeConnections.length === 1
                  ? "1 aktywne połączenie."
                  : `${activeConnections.length} aktywnych połączeń.`}
              </small>
            </div>
            <span
              aria-hidden="true"
              className={`integration-overview__state ${activeConnections.length > 0 ? "is-success" : "is-neutral"}`}
            >
              {activeConnections.length > 0 ? <PanelIcon name="check" /> : "—"}
            </span>
          </div>
          <div className="integration-overview__item">
            <span className="integration-overview__icon">
              <PanelIcon name="bolt" />
            </span>
            <div>
              <span className="integration-overview__label">Token instalacyjny</span>
              <strong>10 minut</strong>
              <small>Jednorazowy i przypisany do dokładnego originu.</small>
            </div>
            <span aria-hidden="true" className="integration-overview__state is-success">
              <PanelIcon name="check" />
            </span>
          </div>
          <div className="integration-overview__item">
            <span className="integration-overview__icon">
              <PanelIcon name="integration" />
            </span>
            <div>
              <span className="integration-overview__label">Sposoby osadzenia</span>
              <strong>3 tryby</strong>
              <small>Shortcode, blok Gutenberg i bezpieczny popup.</small>
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
              <span className="integration-overview__label">Granica danych</span>
              <strong>Kwotum</strong>
              <small>Leady, odpowiedzi i obliczenia nie są zapisywane w WordPressie.</small>
            </div>
            <span aria-hidden="true" className="integration-overview__state is-success">
              <PanelIcon name="check" />
            </span>
          </div>
        </section>

        <div className="wordpress-operations-grid">
          <section
            className="panel-card integration-connections wordpress-connections-card"
            aria-labelledby="wordpress-connections-title"
          >
            <div className="panel-card__header">
              <div>
                <h2 id="wordpress-connections-title">Połączone strony</h2>
                <p>Wersje środowiska i ostatni heartbeat każdej instalacji.</p>
              </div>
              <span className="panel-status panel-status--neutral">
                {activeConnections.length} aktywnych
              </span>
            </div>
            {latestHeartbeat ? (
              <p className="wordpress-heartbeat">
                <PanelIcon name="check" /> Ostatni heartbeat: {formatDate(latestHeartbeat)}
              </p>
            ) : null}
            {connections.length === 0 ? (
              <div className="integration-empty-state">
                <EmptyState
                  description="Wygeneruj token i wklej go w ustawieniach wtyczki."
                  title="Brak połączonych stron"
                />
              </div>
            ) : (
              <ul className="connection-list">
                {connections.map((connection) => (
                  <li key={connection.id}>
                    <span className="integration-row__icon">
                      <PanelIcon name="external" />
                    </span>
                    <span>
                      <strong>{connection.siteOrigin}</strong>
                      <small>
                        WordPress {connection.wordpressVersion} · PHP {connection.phpVersion} ·
                        wtyczka {connection.pluginVersion}
                      </small>
                    </span>
                    <time dateTime={connection.lastSeenAt}>
                      {formatDate(connection.lastSeenAt)}
                    </time>
                    {connection.revokedAt ? (
                      <span className="panel-status panel-status--neutral">Odłączono</span>
                    ) : (
                      <form action={revokeWordPressConnectionAction}>
                        <input name="organizationId" type="hidden" value={organizationId} />
                        <input name="connectionId" type="hidden" value={connection.id} />
                        <Button size="small" type="submit" variant="secondary">
                          Unieważnij
                        </Button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <WordPressTokenForm organizationId={organizationId} />
        </div>
      </div>
    </main>
  );
}
