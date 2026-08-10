"use client";

import { Button, EmptyState } from "@wyceno/ui";

import { PanelPageHeader } from "../../panel-page-header";

export default function AnalyticsError({ reset }: { reset: () => void }) {
  return (
    <main className="panel-workspace analytics-panel">
      <PanelPageHeader title="Analityka" />
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
