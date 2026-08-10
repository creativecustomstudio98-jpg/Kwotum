import { EmptyState, LinkButton } from "@wyceno/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { requireTenantContext } from "../../../../lib/auth/tenant-context";
import { listFlowDrafts } from "../../../../lib/flows/service";
import { PanelIcon } from "../../panel-icon";

export const metadata: Metadata = { title: "Procesy" };
export const dynamic = "force-dynamic";

export default async function ProcessesPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const context = await requireTenantContext(organizationId);
  const flows = await listFlowDrafts(context);
  const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <main className="panel-workspace processes-panel">
      <div className="panel-page">
        <section className="panel-card process-list-surface" aria-labelledby="process-page-title">
          <header className="process-list-heading">
            <h1 id="process-page-title">Procesy / Formularze</h1>
            <LinkButton
              className="process-list-create"
              href={`/panel/${organizationId}/szablony`}
              size="small"
            >
              <span aria-hidden="true">+</span>
              Nowy proces
            </LinkButton>
          </header>
          <div className="process-list-toolbar">
            <h2 id="process-list-title">Wszystkie</h2>
          </div>
          {flows.length === 0 ? (
            <EmptyState
              action={
                <LinkButton href={`/panel/${organizationId}/szablony`} size="small">
                  Wybierz szablon
                </LinkButton>
              }
              description="Utwórz pierwszy draft z jednego z pięciu zweryfikowanych szablonów."
              title="Nie ma jeszcze procesów"
            />
          ) : (
            <ul className="process-list">
              {flows.map((flow) => {
                const versionLabel = flow.latestPublishedVersion
                  ? `wersja ${flow.latestPublishedVersion}`
                  : `draft r${flow.draftRevision}`;

                return (
                  <li key={flow.id}>
                    <Link
                      aria-label={`Edytuj proces ${flow.name}`}
                      className="process-list-row"
                      href={`/panel/${organizationId}/procesy/${flow.id}`}
                    >
                      <span className="process-list-row__identity">
                        <strong>{flow.name}</strong>
                        <small>
                          {flow.stepCount} {flow.stepCount === 1 ? "pytanie" : "pytań"} ·{" "}
                          {versionLabel}
                        </small>
                      </span>
                      <span
                        className={`panel-status panel-status--${
                          flow.status === "published" ? "qualified" : "inactive"
                        }`}
                      >
                        {flow.status === "published" ? "Aktywny" : "Nieaktywny"}
                      </span>
                      <time dateTime={flow.updatedAt}>
                        {dateFormatter.format(new Date(flow.updatedAt))}
                      </time>
                      <span aria-hidden="true" className="process-list-row__edit">
                        <PanelIcon name="edit" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
