import { Skeleton } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../panel-tenant-page-header";
import { SettingsNavigation } from "../settings-navigation";

export default function NotificationsLoading() {
  return (
    <main aria-busy="true" className="panel-workspace settings-panel">
      <PanelTenantPageHeader
        currentLabel="Ustawienia"
        description="Reguły i historia systemowych wiadomości organizacji."
        navigation={<SettingsNavigation />}
        title="Ustawienia"
      />
      <div className="panel-page">
        <Skeleton label="Wczytywanie dostaw powiadomień" lines={7} />
      </div>
    </main>
  );
}
