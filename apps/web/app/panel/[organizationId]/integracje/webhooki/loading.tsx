import { Skeleton } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../../panel-tenant-page-header";
import { IntegrationsNavigation } from "../../integrations-navigation";

export default function WebhookIntegrationLoading() {
  return (
    <main aria-busy="true" className="panel-workspace webhook-panel">
      <PanelTenantPageHeader
        currentLabel="Integracje"
        description="Bezpieczna wymiana zdarzeń organizacji."
        navigation={<IntegrationsNavigation />}
        title="Integracje"
      />
      <div className="panel-page integrations-workspace">
        <section className="panel-card integration-state-card">
          <Skeleton label="Sprawdzanie konfiguracji webhooków" lines={9} />
        </section>
      </div>
    </main>
  );
}
