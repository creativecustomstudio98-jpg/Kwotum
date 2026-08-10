import { Skeleton } from "@wyceno/ui";

export default function NotificationsLoading() {
  return (
    <main aria-busy="true" className="panel-workspace settings-panel">
      <header className="panel-topbar">
        <div className="panel-topbar__context">
          <div>
            <p className="panel-topbar__eyebrow">Ustawienia</p>
            <h1>Powiadomienia</h1>
          </div>
        </div>
      </header>
      <div className="panel-page">
        <Skeleton label="Wczytywanie dostaw powiadomień" lines={7} />
      </div>
    </main>
  );
}
