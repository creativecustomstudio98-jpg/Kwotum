"use client";

import { Button, EmptyState } from "@wyceno/ui";

export default function TemplatesError({ reset }: { reset: () => void }) {
  return (
    <main className="panel-workspace templates-panel">
      <div className="panel-page">
        <section className="panel-card template-library-surface">
          <header className="template-library-heading">
            <div>
              <h1>Szablony branżowe</h1>
              <p>Wybierz gotowy punkt startowy dla nowego procesu.</p>
            </div>
          </header>
          <EmptyState
            action={<Button onClick={reset}>Spróbuj ponownie</Button>}
            description="Nie udało się przygotować biblioteki procesów."
            title="Szablony są chwilowo niedostępne"
          />
        </section>
      </div>
    </main>
  );
}
