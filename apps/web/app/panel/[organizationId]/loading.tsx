export default function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Ładowanie dashboardu"
      className="panel-workspace dashboard-panel"
    >
      <header className="panel-topbar">
        <div className="panel-topbar__context">
          <div>
            <h1>Dashboard</h1>
            <div className="panel-topbar__description">
              Przegląd najważniejszych danych i zadań w organizacji.
            </div>
          </div>
        </div>
      </header>
      <div aria-hidden="true" className="panel-page dashboard-page dashboard-loading">
        <div className="dashboard-loading__metrics">
          {Array.from({ length: 6 }, (_, index) => (
            <i key={index} />
          ))}
        </div>
        <div className="dashboard-loading__primary">
          <i />
          <i />
          <i />
        </div>
        <div className="dashboard-loading__secondary">
          <i />
          <i />
          <i />
        </div>
      </div>
    </main>
  );
}
