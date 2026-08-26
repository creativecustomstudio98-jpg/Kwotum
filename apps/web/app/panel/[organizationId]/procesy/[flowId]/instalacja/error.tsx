"use client";

import { Button, EmptyState } from "@wyceno/ui";

import { PanelTenantPageHeader } from "../../../../panel-tenant-page-header";

export default function InstallationError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="panel-workspace installation-panel installation-panel--m7">
      <PanelTenantPageHeader
        currentLabel="Podgląd i udostępnianie"
        description="Publikacja i instalacja procesu."
        title="Podgląd i udostępnianie"
      />
      <div className="panel-page">
        <EmptyState
          action={<Button onClick={reset}>Ponów</Button>}
          description="Sprawdź publikację procesu i spróbuj ponownie."
          title="Nie udało się pobrać danych instalacji"
        />
      </div>
    </main>
  );
}
