"use client";

import { Button, EmptyState } from "@wyceno/ui";
import { useEffect } from "react";

export default function LeadDetailError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error("Lead detail failed to render.", error.digest ?? "no-digest");
  }, [error]);

  return (
    <main className="panel-workspace lead-operation lead-reference-page">
      <article className="lead-reference">
        <EmptyState
          action={
            <Button onClick={reset} type="button">
              Spróbuj ponownie
            </Button>
          }
          description="Nie udało się bezpiecznie pobrać odpowiedzi, plików i historii."
          title="Szczegóły leada są chwilowo niedostępne"
        />
      </article>
    </main>
  );
}
