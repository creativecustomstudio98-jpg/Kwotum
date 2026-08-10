import { Skeleton } from "@wyceno/ui";

export default function OnboardingLoading() {
  return (
    <main aria-busy="true" className="panel-workspace onboarding-panel">
      <header className="panel-topbar">
        <div className="panel-topbar__context">
          <div>
            <p className="panel-topbar__eyebrow">Konfiguracja konta</p>
            <h1>Uruchom pierwszy proces</h1>
          </div>
        </div>
      </header>
      <div className="panel-page">
        <Skeleton label="Wczytywanie postępu uruchomienia" lines={8} />
      </div>
    </main>
  );
}
