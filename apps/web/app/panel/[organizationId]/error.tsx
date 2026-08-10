"use client";

import { Button, EmptyState } from "@wyceno/ui";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main className="panel-workspace dashboard-panel">
      <div className="panel-page dashboard-page">
        <EmptyState
          action={
            <Button onClick={reset} type="button">
              Spróbuj ponownie
            </Button>
          }
          description="Nie udało się bezpiecznie pobrać agregatów organizacji."
          title="Dashboard jest chwilowo niedostępny"
        />
      </div>
    </main>
  );
}
