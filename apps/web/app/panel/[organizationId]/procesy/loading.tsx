import { Skeleton } from "@wyceno/ui";

export default function ProcessesLoading() {
  return (
    <main aria-busy="true" className="panel-workspace processes-panel">
      <div className="panel-page">
        <section className="panel-card process-list-surface">
          <header className="process-list-heading">
            <h1>Procesy / Formularze</h1>
          </header>
          <div className="process-list-toolbar">
            <h2>Wszystkie</h2>
          </div>
          <Skeleton label="Ładowanie procesów" lines={5} />
        </section>
      </div>
    </main>
  );
}
