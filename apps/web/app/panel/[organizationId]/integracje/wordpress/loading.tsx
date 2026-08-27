import { Skeleton } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../../panel-tenant-page-header";
import { IntegrationsNavigation } from "../../integrations-navigation";

export default function WordPressIntegrationLoading() {
  return (
    <main aria-busy="true" className="panel-workspace wordpress-panel">
      <PanelTenantPageHeader
        currentLabel="Integracje"
        description="Połączenia zewnętrzne organizacji."
        navigation={<IntegrationsNavigation />}
        title="Integracje"
      />
      <div className="panel-page integrations-workspace">
        <section className="panel-card integration-state-card">
          <Skeleton label="Sprawdzanie połączeń WordPress" lines={7} />
        </section>
      </div>
    </main>
  );
}
