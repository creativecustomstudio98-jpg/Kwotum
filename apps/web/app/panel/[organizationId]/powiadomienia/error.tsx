"use client";

import { Button, EmptyState } from "@wyceno/ui";

export default function NotificationsError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="panel-workspace settings-panel">
      <div className="panel-page">
        <EmptyState
          action={<Button onClick={reset}>Ponów</Button>}
          description="Spróbuj ponownie. Adresy odbiorców pozostają zamaskowane."
          title="Nie udało się pobrać dostaw powiadomień"
        />
      </div>
    </main>
  );
}
