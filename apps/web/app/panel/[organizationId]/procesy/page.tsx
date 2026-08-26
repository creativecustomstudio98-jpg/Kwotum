import { EmptyState, LinkButton, StatusBadge } from "@wyceno/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { requireTenantContext } from "../../../../lib/auth/tenant-context";
import { listFlowDraftPage } from "../../../../lib/flows/service";
import { PanelPagination } from "../../panel-pagination";
import { parseListPage } from "../../pagination-model";
import { PanelIcon } from "../../panel-icon";
import { PanelPageHeader } from "../../panel-page-header";

export const metadata: Metadata = { title: "Procesy" };
export const dynamic = "force-dynamic";

export default async function ProcessesPage({
  params,
  searchParams,
}: {
  params: Promise<{ organizationId: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { organizationId } = await params;
  const query = await searchParams;
  const context = await requireTenantContext(organizationId);
  const flowPage = await listFlowDraftPage(context, {
    page: parseListPage(query.page),
    pageSize: 12,
  });
  const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <main className="panel-workspace processes-panel">
      <PanelPageHeader
        actions={
          <LinkButton
            className="record-primary-action"
            href={`/panel/${organizationId}/szablony`}
            size="small"
            variant="primary"
          >
            <PanelIcon name="plus" />
            Nowy proces
          </LinkButton>
        }
        breadcrumbs={[
          { href: `/panel/${organizationId}`, label: "Przegląd" },
          { label: "Procesy" },
        ]}
        description="Formularze, konfiguratory i ich opublikowane wersje."
        title="Procesy"
      />

      <section
        aria-labelledby="process-list-title"
        className="record-list-surface process-list-surface"
      >
        <div className="record-list-meta process-list-toolbar">
          <h2 id="process-list-title">Wszystkie procesy</h2>
          <p>
            <strong>{flowPage.total}</strong> {processCountLabel(flowPage.total)}
          </p>
        </div>

        {flowPage.items.length === 0 ? (
          <div className="record-list-empty">
            <EmptyState
              action={
                <LinkButton href={`/panel/${organizationId}/szablony`} size="small">
                  Wybierz szablon
                </LinkButton>
              }
              description="Utwórz pierwszy proces z jednego ze zweryfikowanych szablonów."
              title="Nie ma jeszcze procesów"
            />
          </div>
        ) : (
          <>
            <div aria-hidden="true" className="process-list-columns">
              <span>Proces</span>
              <span>Status</span>
              <span>Ostatnia zmiana</span>
              <span />
            </div>
            <ul className="process-list">
              {flowPage.items.map((flow) => {
                const versionLabel = flow.latestPublishedVersion
                  ? `wersja ${flow.latestPublishedVersion}`
                  : `draft r${flow.draftRevision}`;
                const stepLabel = `${flow.stepCount} ${questionCountLabel(flow.stepCount)}`;

                return (
                  <li key={flow.id}>
                    <Link
                      className="process-list-row"
                      href={`/panel/${organizationId}/procesy/${flow.id}`}
                    >
                      <span className="process-list-row__identity">
                        <strong>{flow.name}</strong>
                        <small>
                          {stepLabel} · {versionLabel}
                        </small>
                      </span>
                      <span className="process-list-row__status">
                        <small>Status</small>
                        <StatusBadge tone={flow.status === "published" ? "success" : "neutral"}>
                          {flow.status === "published" ? "Aktywny" : "Nieaktywny"}
                        </StatusBadge>
                      </span>
                      <span className="process-list-row__date">
                        <small>Ostatnia zmiana</small>
                        <time dateTime={flow.updatedAt}>
                          {dateFormatter.format(new Date(flow.updatedAt))}
                        </time>
                      </span>
                      <span aria-hidden="true" className="process-list-row__open">
                        <PanelIcon name="arrow-right" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <PanelPagination
          ariaLabel="Paginacja procesów"
          currentPage={flowPage.page}
          hrefForPage={(page) => processListHref(organizationId, page)}
          pageCount={flowPage.pageCount}
        />
      </section>
    </main>
  );
}

function processListHref(organizationId: string, page: number): string {
  return `/panel/${organizationId}/procesy${page > 1 ? `?page=${page}` : ""}`;
}

function questionCountLabel(count: number): string {
  if (count === 1) return "pytanie";
  const lastTwo = count % 100;
  const last = count % 10;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return "pytania";
  return "pytań";
}

function processCountLabel(count: number): string {
  if (count === 1) return "proces";
  const lastTwo = count % 100;
  const last = count % 10;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return "procesy";
  return "procesów";
}
