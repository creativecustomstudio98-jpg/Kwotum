import { Skeleton } from "@wyceno/ui";

export default function LeadDetailLoading() {
  return (
    <main aria-busy="true" className="panel-workspace lead-operation lead-reference-page">
      <article className="lead-reference lead-reference--m6 lead-reference--loading">
        <header className="lead-reference-loading__header">
          <Skeleton label="Ładowanie danych klienta" lines={2} />
          <Skeleton label="Ładowanie metadanych zapytania" lines={2} />
        </header>
        <section className="lead-reference-loading__score">
          <Skeleton label="Ładowanie wyniku kwalifikacji" lines={3} />
        </section>
        <div className="lead-reference-loading__tabs" aria-hidden="true" />
        <div className="lead-reference-loading__workspace">
          <section>
            <Skeleton label="Ładowanie podsumowania zapytania" lines={8} />
          </section>
          <aside>
            <Skeleton label="Ładowanie operacji leada" lines={7} />
          </aside>
        </div>
      </article>
    </main>
  );
}
