import { Skeleton } from "@wyceno/ui";

export default function HelpLoading() {
  return (
    <main aria-busy="true" className="panel-workspace help-center-panel">
      <div className="panel-topbar">
        <div className="panel-topbar__context">
          <div>
            <h1>Pomoc</h1>
            <div className="panel-topbar__description">
              Praktyczne instrukcje oparte na funkcjach dostępnych w Twojej organizacji.
            </div>
          </div>
        </div>
      </div>
      <div className="panel-page help-center-page">
        <section className="help-center help-center--loading">
          <Skeleton label="Ładowanie poradnika" lines={8} />
        </section>
      </div>
    </main>
  );
}
