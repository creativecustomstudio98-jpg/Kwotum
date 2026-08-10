"use client";

import { Button, EmptyState } from "@wyceno/ui";

export default function WebhookIntegrationError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="panel-workspace settings-panel">
      <div className="panel-page">
        <EmptyState
          action={<Button onClick={reset}>Ponów</Button>}
          description="Spróbuj ponownie. Sekrety endpointów nie są odczytywane ani zwracane przez ten ekran."
          title="Nie udało się pobrać webhooków"
        />
      </div>
    </main>
  );
}
