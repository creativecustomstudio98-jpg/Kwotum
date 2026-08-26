import { Skeleton } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../../../panel-tenant-page-header";

export default function InstallationLoading() {
  return (
    <main aria-busy="true" className="panel-workspace installation-panel installation-panel--m7">
      <PanelTenantPageHeader
        currentLabel="Podgląd i udostępnianie"
        description="Publikacja i instalacja procesu."
        title="Podgląd i udostępnianie"
      />
      <div className="panel-page">
        <Skeleton label="Wczytywanie instalacji procesu" lines={8} />
      </div>
    </main>
  );
}
