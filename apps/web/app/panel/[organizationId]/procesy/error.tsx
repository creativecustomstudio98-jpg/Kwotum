"use client";

import { Button, EmptyState } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../panel-tenant-page-header";

export default function ProcessesError({ reset }: { reset: () => void }) {
  return (
    <main className="panel-workspace processes-panel">
      <PanelTenantPageHeader
        currentLabel="Procesy"
        description="Formularze, konfiguratory i ich opublikowane wersje."
        title="Procesy"
        utilityAction={{ hrefSuffix: "/szablony", label: "Nowy proces" }}
      />
      <section
        aria-live="assertive"
        className="record-list-surface process-list-surface"
        role="alert"
      >
        <EmptyState
          action={<Button onClick={reset}>Spróbuj ponownie</Button>}
          description="Nie udało się pobrać draftów i opublikowanych wersji."
          title="Procesy są chwilowo niedostępne"
        />
      </section>
    </main>
  );
}
