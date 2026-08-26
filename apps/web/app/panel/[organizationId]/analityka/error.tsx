"use client";

import { Button, EmptyState } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../panel-tenant-page-header";

export default function AnalyticsError({ reset }: { reset: () => void }) {
  return (
    <main className="panel-workspace analytics-panel">
      <PanelTenantPageHeader
        currentLabel="Analityka"
        description="Wyniki procesów z zachowaniem progów prywatności."
        title="Analityka"
      />
      <div className="panel-page">
        <section className="panel-card analytics-privacy-state">
          <EmptyState
            action={<Button onClick={reset}>Ponów obliczenie</Button>}
            description="Spróbuj ponownie. Jeśli problem wraca, sprawdź stan usługi."
            title="Nie udało się obliczyć okresu"
          />
        </section>
      </div>
    </main>
  );
}
