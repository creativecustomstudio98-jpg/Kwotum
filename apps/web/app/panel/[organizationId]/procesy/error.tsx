"use client";

import { Button, EmptyState } from "@wyceno/ui";

export default function ProcessesError({ reset }: { reset: () => void }) {
  return (
    <main className="panel-workspace processes-panel">
      <div className="panel-page">
        <section className="panel-card process-list-surface">
          <header className="process-list-heading">
            <h1>Procesy / Formularze</h1>
          </header>
          <EmptyState
            action={<Button onClick={reset}>Spróbuj ponownie</Button>}
            description="Nie udało się pobrać draftów i opublikowanych wersji."
            title="Procesy są chwilowo niedostępne"
          />
        </section>
      </div>
    </main>
  );
}
