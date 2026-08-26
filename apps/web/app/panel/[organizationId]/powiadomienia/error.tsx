"use client";

import { Button, EmptyState } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../panel-tenant-page-header";
import { SettingsNavigation } from "../settings-navigation";

export default function NotificationsError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="panel-workspace settings-panel">
      <PanelTenantPageHeader
        currentLabel="Ustawienia"
        description="Reguły i historia systemowych wiadomości organizacji."
        navigation={<SettingsNavigation />}
        title="Ustawienia"
      />
      <div className="panel-page">
        <EmptyState
          action={<Button onClick={reset}>Ponów</Button>}
          description="Spróbuj ponownie. Adresy odbiorców pozostają zamaskowane."
          title="Nie udało się pobrać dostaw powiadomień"
        />
      </div>
    </main>
  );
}
