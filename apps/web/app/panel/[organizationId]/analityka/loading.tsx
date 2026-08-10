import { Skeleton } from "@wyceno/ui";

import { PanelPageHeader } from "../../panel-page-header";

export default function AnalyticsLoading() {
  return (
    <main aria-busy="true" className="panel-workspace analytics-panel">
      <PanelPageHeader title="Analityka" />
      <div className="panel-page">
        <section aria-label="Obliczamy podsumowanie okresu">
          <div className="metric-grid">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="metric-card" key={index}>
                <Skeleton label="Obliczamy wskaźnik" lines={2} />
              </div>
            ))}
          </div>
        </section>
        <section className="panel-card analytics-loading-card">
          <Skeleton label="Obliczamy bezpieczne agregaty" lines={6} />
        </section>
      </div>
    </main>
  );
}
