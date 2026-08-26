"use client";

import { Button, EmptyState } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../../panel-tenant-page-header";
import { IntegrationsNavigation } from "../../integrations-navigation";

export default function WordPressIntegrationError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="panel-workspace wordpress-panel">
      <PanelTenantPageHeader
        currentLabel="Integracje"
        description="Połączenia zewnętrzne organizacji."
        navigation={<IntegrationsNavigation />}
        title="Integracje"
        utilityAction={{ hrefSuffix: "/procesy", label: "Przejdź do procesów" }}
      />
      <div className="panel-page">
        <EmptyState
          action={<Button onClick={reset}>Ponów</Button>}
          description="Spróbuj ponownie. Aktywny credential nie jest ujawniany przez ten ekran."
          title="Nie udało się pobrać integracji"
        />
      </div>
    </main>
  );
}
