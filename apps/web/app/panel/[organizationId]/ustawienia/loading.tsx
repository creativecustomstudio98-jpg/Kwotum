import { Skeleton } from "@wyceno/ui";

export default function OrganizationSettingsLoading() {
  return (
    <main aria-busy="true" className="panel-workspace settings-panel">
      <header className="panel-topbar">
        <div className="panel-topbar__context">
          <div>
            <p className="panel-topbar__eyebrow">Organizacja</p>
            <h1>Ustawienia organizacji</h1>
          </div>
        </div>
      </header>
      <div className="panel-page">
        <Skeleton label="Wczytywanie ustawień organizacji" lines={7} />
      </div>
    </main>
  );
}
