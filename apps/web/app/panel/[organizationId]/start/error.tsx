"use client";

import { Button, EmptyState } from "@wyceno/ui";

export default function OnboardingError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="panel-workspace onboarding-panel">
      <div className="panel-page">
        <EmptyState
          action={<Button onClick={reset}>Ponów</Button>}
          description="Spróbuj ponownie. Istniejące procesy i publikacje nie zostały zmienione."
          title="Nie udało się ustalić postępu uruchomienia"
        />
      </div>
    </main>
  );
}
