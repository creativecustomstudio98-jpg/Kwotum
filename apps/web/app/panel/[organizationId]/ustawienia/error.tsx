"use client";

import { Button, EmptyState } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../panel-tenant-page-header";
import { SettingsNavigation } from "../settings-navigation";

export default function OrganizationSettingsError({
  reset,
}: Readonly<{
  reset: () => void;
}>) {
  return (
    <main className="panel-workspace settings-panel">
      <PanelTenantPageHeader
        currentLabel="Ustawienia"
        description="Dane organizacji, branding i dostawa nowych leadów."
        navigation={<SettingsNavigation />}
        title="Ustawienia"
      />
      <div className="panel-page settings-page">
        <div className="settings-page__content">
          <div className="settings-surface settings-error-surface">
            <EmptyState
              action={<Button onClick={reset}>Ponów</Button>}
              description="Sprawdź aktywną organizację i uprawnienia właściciela."
              title="Nie udało się wczytać ustawień organizacji"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
