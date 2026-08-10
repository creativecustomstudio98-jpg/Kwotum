import { Skeleton } from "@wyceno/ui";

export default function InstallationLoading() {
  return (
    <main aria-busy="true" className="panel-workspace installation-panel">
      <header className="panel-topbar">
        <div className="panel-topbar__context">
          <div>
            <p className="panel-topbar__eyebrow">Proces</p>
            <h1>Instalacja procesu</h1>
          </div>
        </div>
      </header>
      <div className="panel-page">
        <Skeleton label="Wczytywanie instalacji procesu" lines={8} />
      </div>
    </main>
  );
}
