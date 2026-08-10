"use client";

import { Button, EmptyState } from "@wyceno/ui";

export default function FlowBuilderError({ reset }: { reset: () => void }) {
  return (
    <main className="panel-workspace panel-workspace--builder">
      <div className="panel-page">
        <EmptyState
          action={<Button onClick={reset}>Odśwież draft</Button>}
          description="Draft mógł zostać zmieniony w innej sesji albo ma nieprawidłowy format."
          title="Nie udało się otworzyć edytora"
        />
      </div>
    </main>
  );
}
