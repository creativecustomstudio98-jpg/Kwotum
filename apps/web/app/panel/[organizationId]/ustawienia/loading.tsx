import { Skeleton } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../panel-tenant-page-header";
import { SettingsNavigation } from "../settings-navigation";

export default function OrganizationSettingsLoading() {
  return (
    <main aria-busy="true" className="panel-workspace settings-panel">
      <PanelTenantPageHeader
        currentLabel="Ustawienia"
        description="Dane organizacji, branding i dostawa nowych leadów."
        navigation={<SettingsNavigation />}
        title="Ustawienia"
      />
      <div className="panel-page settings-page">
        <div className="settings-page__content">
          {[4, 4, 3, 2].map((lines, index) => (
            <section className="settings-section" key={lines + index}>
              <Skeleton label={`Wczytywanie sekcji ustawień ${index + 1}`} lines={1} />
              <div className="settings-surface">
                <Skeleton label="Wczytywanie danych sekcji" lines={lines} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
