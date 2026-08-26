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
        utilityAction={{ hrefSuffix: "/procesy", label: "Przejdź do procesów" }}
      />
      <div className="panel-page">
        <Skeleton label="Sprawdzanie połączeń WordPress" lines={7} />
      </div>
    </main>
  );
}
