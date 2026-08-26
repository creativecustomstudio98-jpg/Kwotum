"use client";

import { Button, EmptyState } from "@wyceno/ui";
import { useEffect } from "react";

import { PanelTenantPageHeader } from "../../panel-tenant-page-header";

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
    <main className="panel-workspace lead-panel">
      <PanelTenantPageHeader
        currentLabel="Leady"
        description="Lista zapytań i ich bieżący status obsługi."
        title="Leady"
      />
      <section aria-live="assertive" className="record-list-surface lead-list-surface" role="alert">
        <EmptyState
          action={
            <Button onClick={reset} type="button">
              Spróbuj ponownie
            </Button>
          }
          description="Nie udało się bezpiecznie pobrać danych. Spróbuj ponownie."
          title="Panel leadów jest chwilowo niedostępny"
        />
      </section>
    </main>
  );
}
