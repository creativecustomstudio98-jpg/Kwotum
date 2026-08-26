import { Skeleton } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../panel-tenant-page-header";

export default function ProcessesLoading() {
  return (
    <main aria-busy="true" className="panel-workspace processes-panel">
      <PanelTenantPageHeader
        currentLabel="Procesy"
        description="Formularze, konfiguratory i ich opublikowane wersje."
        title="Procesy"
        utilityAction={{ hrefSuffix: "/szablony", label: "Nowy proces" }}
      />
      <section className="record-list-surface process-list-surface">
        <div className="record-list-meta process-list-toolbar">
          <h2>Wszystkie procesy</h2>
        </div>
        <Skeleton label="Ładowanie procesów" lines={5} />
      </section>
    </main>
  );
}
