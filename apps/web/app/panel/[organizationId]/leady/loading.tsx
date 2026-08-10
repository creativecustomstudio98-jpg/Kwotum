import { Skeleton } from "@wyceno/ui";

export default function LeadsLoading() {
  return (
    <main aria-busy="true" className="panel-workspace lead-panel">
      <header className="panel-topbar">
        <div className="panel-topbar__context">
          <div>
            <p className="panel-topbar__eyebrow">Obsługa zapytań</p>
            <h1>Leady</h1>
          </div>
        </div>
      </header>
      <div className="panel-page">
        <Skeleton label="Ładowanie leadów" lines={8} />
      </div>
    </main>
  );
}
