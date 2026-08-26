"use client";

import { Button, EmptyState } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../panel-tenant-page-header";
import { SettingsNavigation } from "../settings-navigation";

export default function PrivacyError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="panel-workspace settings-panel">
      <PanelTenantPageHeader
        currentLabel="Ustawienia"
        description="Retencja, blokady prawne i granice danych organizacji."
        navigation={<SettingsNavigation />}
        title="Ustawienia"
      />
      <div className="panel-page">
        <EmptyState
          action={<Button onClick={reset}>Ponów</Button>}
          description="Sprawdź uprawnienia właściciela organizacji i spróbuj ponownie."
          title="Nie udało się wczytać ustawień prywatności"
        />
      </div>
    </main>
  );
}
