"use client";

import { Button, EmptyState } from "@wyceno/ui";

export default function InstallationError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="panel-workspace installation-panel">
      <div className="panel-page">
        <EmptyState
          action={<Button onClick={reset}>Ponów</Button>}
          description="Sprawdź publikację procesu i spróbuj ponownie."
          title="Nie udało się pobrać danych instalacji"
        />
      </div>
    </main>
  );
}
