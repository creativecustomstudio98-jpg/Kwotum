import { Skeleton } from "@wyceno/ui";

export default function PrivacyLoading() {
  return (
    <main aria-busy="true" className="panel-workspace settings-panel">
      <header className="panel-topbar">
        <div className="panel-topbar__context">
          <div>
            <p className="panel-topbar__eyebrow">Ustawienia</p>
            <h1>Prywatność</h1>
          </div>
        </div>
      </header>
      <div className="panel-page">
        <Skeleton label="Wczytywanie ustawień prywatności" lines={6} />
      </div>
    </main>
  );
}
