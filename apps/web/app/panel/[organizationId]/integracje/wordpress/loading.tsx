import { Skeleton } from "@wyceno/ui";

export default function WordPressIntegrationLoading() {
  return (
    <main aria-busy="true" className="panel-workspace settings-panel">
      <header className="panel-topbar">
        <div className="panel-topbar__context">
          <div>
            <p className="panel-topbar__eyebrow">Integracje</p>
            <h1>WordPress</h1>
          </div>
        </div>
      </header>
      <div className="panel-page">
        <Skeleton label="Sprawdzanie połączeń WordPress" lines={7} />
      </div>
    </main>
  );
}
