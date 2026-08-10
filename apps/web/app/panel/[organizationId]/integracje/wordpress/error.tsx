"use client";

import { Button, EmptyState } from "@wyceno/ui";

export default function WordPressIntegrationError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="panel-workspace settings-panel">
      <div className="panel-page">
        <EmptyState
          action={<Button onClick={reset}>Ponów</Button>}
          description="Spróbuj ponownie. Aktywny credential nie jest ujawniany przez ten ekran."
          title="Nie udało się pobrać integracji"
        />
      </div>
    </main>
  );
}
