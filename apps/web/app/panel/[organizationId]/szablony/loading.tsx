import { Skeleton } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../panel-tenant-page-header";

export default function TemplatesLoading() {
  return (
    <main aria-busy="true" className="panel-workspace templates-panel">
      <PanelTenantPageHeader
        currentLabel="Szablony"
        description="Wybierz gotowy punkt startowy dla nowego procesu."
        parent={{ hrefSuffix: "/procesy", label: "Procesy" }}
        title="Szablony branżowe"
        utilityAction={{ hrefSuffix: "/procesy", label: "Moje procesy" }}
      />
      <section aria-label="Ładowanie biblioteki szablonów" className="template-library-surface">
        <Skeleton label="Ładowanie szablonów" lines={5} />
      </section>
    </main>
  );
}
