"use client";

import { Button, EmptyState } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../../panel-tenant-page-header";
import { IntegrationsNavigation } from "../../integrations-navigation";

export default function WebhookIntegrationError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="panel-workspace webhook-panel">
      <PanelTenantPageHeader
        currentLabel="Integracje"
        description="Bezpieczna wymiana zdarzeń organizacji."
        navigation={<IntegrationsNavigation />}
        title="Integracje"
      />
      <div className="panel-page integrations-workspace">
        <section className="panel-card integration-state-card">
          <EmptyState
            action={<Button onClick={reset}>Ponów</Button>}
            description="Spróbuj ponownie. Sekrety endpointów nie są odczytywane ani zwracane przez ten ekran."
            title="Nie udało się pobrać webhooków"
          />
        </section>
      </div>
    </main>
  );
}
