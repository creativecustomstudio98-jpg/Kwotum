"use client";

import { Button, EmptyState } from "@wyceno/ui";

export default function HelpError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="panel-workspace help-center-panel">
      <div className="panel-page help-center-page">
        <section className="help-center help-center--state">
          <EmptyState
            action={<Button onClick={reset}>Spróbuj ponownie</Button>}
            description="Nie udało się przygotować instrukcji dla bieżącej organizacji."
            title="Pomoc jest chwilowo niedostępna"
          />
        </section>
      </div>
    </main>
  );
}
