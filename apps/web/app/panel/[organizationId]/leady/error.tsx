"use client";

import { Button, EmptyState } from "@wyceno/ui";
import { useEffect } from "react";

export default function LeadsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Lead panel failed to render.", error.digest ?? "no-digest");
  }, [error]);

  return (
    <main className="panel-workspace">
      <div className="panel-page">
        <EmptyState
          action={
            <Button onClick={reset} type="button">
              Spróbuj ponownie
            </Button>
          }
          description="Nie udało się bezpiecznie pobrać danych. Spróbuj ponownie."
          title="Panel leadów jest chwilowo niedostępny"
        />
      </div>
    </main>
  );
}
