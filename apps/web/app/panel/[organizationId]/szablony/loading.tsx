import { Skeleton } from "@wyceno/ui";

export default function TemplatesLoading() {
  return (
    <main aria-busy="true" className="panel-workspace templates-panel">
      <div className="panel-page">
        <section className="panel-card template-library-surface">
          <header className="template-library-heading">
            <div>
              <h1>Szablony branżowe</h1>
              <p>Wybierz gotowy punkt startowy dla nowego procesu.</p>
            </div>
          </header>
          <Skeleton label="Ładowanie szablonów" lines={5} />
        </section>
      </div>
    </main>
  );
}
