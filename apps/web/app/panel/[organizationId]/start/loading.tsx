import { Skeleton } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../panel-tenant-page-header";

export default function OnboardingLoading() {
  return (
    <main aria-busy="true" className="panel-workspace onboarding-panel">
      <PanelTenantPageHeader
        currentLabel="Uruchomienie"
        description="Kroki potrzebne do opublikowania i zainstalowania pierwszego procesu."
        title="Uruchom pierwszy proces"
      />
      <div className="panel-page">
        <Skeleton label="Wczytywanie postępu uruchomienia" lines={8} />
      </div>
    </main>
  );
}
