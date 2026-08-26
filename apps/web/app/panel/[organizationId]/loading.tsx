import { PanelPageHeader } from "../panel-page-header";

export default function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Ładowanie dashboardu"
      className="panel-workspace dashboard-panel dashboard-loading"
    >
      <PanelPageHeader
        actions={
          <div aria-hidden="true" className="dashboard-header-actions dashboard-loading__actions">
            <i className="dashboard-loading__search-control" />
            <i className="dashboard-loading__period-control" />
          </div>
        }
        breadcrumbs={[{ href: "/panel", label: "Organizacje" }, { label: "Przegląd" }]}
        description="Przegląd najważniejszych danych i zadań w organizacji."
        title="Przegląd"
      />
      <div aria-hidden="true" className="panel-page dashboard-page">
        <section className="dashboard-loading__block dashboard-loading__summary">
          <div className="dashboard-loading__metric-grid">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="dashboard-loading__metric" key={index}>
                <i />
                <i />
                <i />
              </div>
            ))}
          </div>
          <div className="dashboard-loading__summary-meta">
            <i />
            <i />
            <i />
          </div>
        </section>

        <div className="dashboard-loading__focus-grid">
          <section className="dashboard-loading__block dashboard-loading__chart">
            <div className="dashboard-loading__heading">
              <i />
              <i />
            </div>
            <div className="dashboard-loading__legend">
              <i />
              <i />
            </div>
            <i className="dashboard-loading__chart-canvas" />
          </section>

          <aside className="dashboard-loading__block dashboard-loading__rail">
            <div className="dashboard-loading__heading">
              <i />
              <i />
            </div>
            <div className="dashboard-loading__rail-items">
              {Array.from({ length: 3 }, (_, index) => (
                <i key={index} />
              ))}
            </div>
          </aside>
        </div>

        <section className="dashboard-loading__block dashboard-loading__table">
          <div className="dashboard-loading__heading">
            <i />
            <i />
          </div>
          <i className="dashboard-loading__table-head" />
          <div className="dashboard-loading__table-rows">
            {Array.from({ length: 5 }, (_, index) => (
              <i key={index} />
            ))}
          </div>
        </section>

        <section className="dashboard-loading__block dashboard-loading__insights">
          <div className="dashboard-loading__heading">
            <i />
            <i />
          </div>
          <div className="dashboard-loading__insight-cells">
            {Array.from({ length: 4 }, (_, index) => (
              <i key={index} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
