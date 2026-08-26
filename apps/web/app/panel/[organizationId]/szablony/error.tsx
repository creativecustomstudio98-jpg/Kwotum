"use client";

import { Button, EmptyState } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../panel-tenant-page-header";

export default function TemplatesError({ reset }: { reset: () => void }) {
  return (
    <main className="panel-workspace templates-panel">
      <PanelTenantPageHeader
        currentLabel="Szablony"
        description="Wybierz gotowy punkt startowy dla nowego procesu."
        parent={{ hrefSuffix: "/procesy", label: "Procesy" }}
        title="Szablony branżowe"
        utilityAction={{ hrefSuffix: "/procesy", label: "Moje procesy" }}
      />
      <section aria-live="assertive" className="template-library-surface" role="alert">
        <EmptyState
          action={<Button onClick={reset}>Spróbuj ponownie</Button>}
          description="Nie udało się przygotować biblioteki procesów."
          title="Szablony są chwilowo niedostępne"
        />
      </section>
    </main>
  );
}
