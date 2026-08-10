import { Skeleton } from "@wyceno/ui";

export default function LeadDetailLoading() {
  return (
    <main aria-busy="true" className="panel-workspace lead-operation lead-reference-page">
      <article className="lead-reference">
        <Skeleton label="Ładowanie szczegółów leada" lines={10} />
      </article>
    </main>
  );
}
