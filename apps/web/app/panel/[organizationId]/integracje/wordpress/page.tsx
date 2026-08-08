import { Button, EmptyState, LinkButton } from "@wyceno/ui";
import type { Metadata } from "next";

import { requireTenantContext } from "../../../../../lib/auth/tenant-context";
import { getWordPressIntegration } from "../../../../../lib/wordpress/service";
import { PanelIcon } from "../../../panel-icon";
import { PanelPageHeader } from "../../../panel-page-header";
import { revokeWordPressConnectionAction } from "./actions";
import { WordPressTokenForm } from "./token-form";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Integracja WordPress",
};

export const dynamic = "force-dynamic";

export default async function WordPressIntegrationPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  await requireTenantContext(organizationId);
  const { connections, organizationName } = await getWordPressIntegration(organizationId);
  const connected = connections.some((connection) => !connection.revokedAt);
  const activeConnections = connections.filter((connection) => !connection.revokedAt);

  return (
    <main className="panel-workspace wordpress-panel">
      <PanelPageHeader
        eyebrow={organizationName}
        title="Integracje"
        actions={
          <LinkButton href={`/panel/${organizationId}/procesy`} size="small" variant="secondary">
            Przejdź do instalacji procesu
          </LinkButton>
        }
      />
      <div className="panel-page integrations-workspace">
        <div className="integrations-primary-grid">
          <section
            className="panel-card integration-summary"
            id="wordpress-configuration"
            aria-labelledby="wordpress-title"
          >
            <div className="integration-row">
              <span className="integration-row__icon">
                <PanelIcon name="integration" />
              </span>
              <div>
                <h2 id="wordpress-title">WordPress</h2>
                <p>Shortcode, blok Gutenberg i popup korzystają z publicznego procesu Kwotum.</p>
              </div>
              <span className={`panel-status panel-status--${connected ? "qualified" : "neutral"}`}>
                {connected ? `${activeConnections.length} połączone` : "Niepołączono"}
              </span>
            </div>
            <div className="integration-security-note">
              <PanelIcon name="privacy" />
              <span>
                Odpowiedzi, leady i obliczenia pozostają w Kwotum. WordPress przechowuje wyłącznie
                credential połączenia.
              </span>
            </div>
          </section>
          <WordPressTokenForm organizationId={organizationId} />
        </div>
        <section
          className="panel-card integration-connections"
          aria-labelledby="wordpress-connections-title"
        >
          <div className="panel-card__header">
            <div>
              <h2 id="wordpress-connections-title">Połączone strony</h2>
              <p>Wersje konektora i ostatni heartbeat każdej tenantowej instalacji.</p>
            </div>
            <span className="panel-status panel-status--neutral">
              {connections.length} {connections.length === 1 ? "strona" : "stron"}
            </span>
          </div>
          {connections.length === 0 ? (
            <EmptyState
              description="Wygeneruj token i wklej go w ustawieniach wtyczki."
              title="Brak połączonych stron"
            />
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
                      WP {connection.wordpressVersion} · PHP {connection.phpVersion} · wtyczka{" "}
                      {connection.pluginVersion}
                    </small>
                  </span>
                  <time dateTime={connection.lastSeenAt}>
                    {new Intl.DateTimeFormat("pl-PL", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(connection.lastSeenAt))}
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
      </div>
    </main>
  );
}
