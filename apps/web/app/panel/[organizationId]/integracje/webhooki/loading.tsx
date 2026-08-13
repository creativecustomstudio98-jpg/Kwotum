import { Skeleton } from "@wyceno/ui";

export default function WebhookIntegrationLoading() {
  return (
    <main aria-busy="true" className="panel-workspace integrations-panel webhook-panel">
      <header className="panel-topbar">
        <div className="panel-topbar__context">
          <div>
            <p className="panel-topbar__eyebrow">Integracje</p>
            <h1>Webhooki</h1>
            <div className="panel-topbar__description">
              Przekazuj nowe leady do zewnętrznych systemów w czasie rzeczywistym.
            </div>
          </div>
        </div>
      </header>
      <div className="panel-page integrations-workspace">
        <Skeleton label="Sprawdzanie konfiguracji webhooków" lines={9} />
      </div>
    </main>
  );
}
