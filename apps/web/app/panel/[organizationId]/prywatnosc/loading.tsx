import { Skeleton } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../panel-tenant-page-header";
import { SettingsNavigation } from "../settings-navigation";

export default function PrivacyLoading() {
  return (
    <main aria-busy="true" className="panel-workspace settings-panel">
      <PanelTenantPageHeader
        currentLabel="Ustawienia"
        description="Retencja, blokady prawne i granice danych organizacji."
        navigation={<SettingsNavigation />}
        title="Ustawienia"
      />
      <div className="panel-page">
        <Skeleton label="Wczytywanie ustawień prywatności" lines={6} />
      </div>
    </main>
  );
}
