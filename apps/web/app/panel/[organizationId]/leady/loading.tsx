import { Skeleton } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../panel-tenant-page-header";

export default function LeadsLoading() {
  return (
    <main aria-busy="true" className="panel-workspace lead-panel">
      <PanelTenantPageHeader
        currentLabel="Leady"
        description="Lista zapytań i ich bieżący status obsługi."
        title="Leady"
      />
      <section
        aria-label="Ładowanie listy leadów"
        className="record-list-surface lead-list-surface"
      >
        <div aria-hidden="true" className="record-loading-tabs" />
        <Skeleton label="Ładowanie leadów" lines={8} />
      </section>
    </main>
  );
}
