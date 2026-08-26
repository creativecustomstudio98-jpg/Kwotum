"use client";

import { Button, EmptyState } from "@wyceno/ui";

import { PanelPageHeader } from "../panel-page-header";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main className="panel-workspace dashboard-panel">
      <PanelPageHeader
        breadcrumbs={[{ href: "/panel", label: "Organizacje" }, { label: "Przegląd" }]}
        description="Przegląd najważniejszych danych i zadań w organizacji."
        title="Przegląd"
      />
      <div className="panel-page dashboard-page">
        <EmptyState
          action={
            <Button onClick={reset} type="button">
              Spróbuj ponownie
            </Button>
          }
          description="Nie udało się bezpiecznie pobrać agregatów organizacji."
          title="Dashboard jest chwilowo niedostępny"
        />
      </div>
    </main>
  );
}
