"use client";

import { Button, EmptyState } from "@wyceno/ui";

export default function OrganizationSettingsError({
  reset,
}: Readonly<{
  reset: () => void;
}>) {
  return (
    <main className="panel-workspace settings-panel">
      <div className="panel-page">
        <EmptyState
          action={<Button onClick={reset}>Ponów</Button>}
          description="Sprawdź aktywną organizację i uprawnienia właściciela."
          title="Nie udało się wczytać ustawień organizacji"
        />
      </div>
    </main>
  );
}
