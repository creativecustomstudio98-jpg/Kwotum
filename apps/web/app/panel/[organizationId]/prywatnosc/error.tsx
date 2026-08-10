"use client";

import { Button, EmptyState } from "@wyceno/ui";

export default function PrivacyError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="panel-workspace settings-panel">
      <div className="panel-page">
        <EmptyState
          action={<Button onClick={reset}>Ponów</Button>}
          description="Sprawdź uprawnienia właściciela organizacji i spróbuj ponownie."
          title="Nie udało się wczytać ustawień prywatności"
        />
      </div>
    </main>
  );
}
