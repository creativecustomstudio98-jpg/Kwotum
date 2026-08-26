import { hasCapability, type LeadStatus } from "@wyceno/database";
import { EmptyState, Input, LinkButton, StatusBadge } from "@wyceno/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { requireTenantContext } from "../../../../lib/auth/tenant-context";
import {
  getLeadListCounts,
  listLeadPage,
  normalizeLeadListSearch,
  type LeadListCounts,
} from "../../../../lib/leads/service";
import { createClient } from "../../../../lib/supabase/server";
import { PanelPagination } from "../../panel-pagination";
import { parseListPage } from "../../pagination-model";
import { PanelIcon } from "../../panel-icon";
import { PanelPageHeader } from "../../panel-page-header";

export const metadata: Metadata = { title: "Leady" };
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ organizationId: string }>;
  searchParams: Promise<{
    page?: string | string[];
    q?: string | string[];
    status?: string | string[];
  }>;
};

type LeadFilter = "completed" | "in_progress" | "new" | "rejected";

const leadFilters: ReadonlyArray<Readonly<{ key?: LeadFilter; label: string }>> = [
  { label: "Wszystkie" },
  { key: "new", label: "Nowe" },
  { key: "in_progress", label: "W trakcie" },
  { key: "completed", label: "Zakończone" },
  { key: "rejected", label: "Odrzucone" },
];

export default async function LeadsPage({ params, searchParams }: PageProps) {
  const { organizationId } = await params;
  const query = await searchParams;
  const status = parseLeadFilter(searchParamValue(query.status));
  const search = normalizeLeadListSearch(searchParamValue(query.q) ?? "");
  const requestedPage = parseListPage(query.page);
  const context = await requireTenantContext(organizationId);
  const supabase = await createClient();
  const [leadPage, counts, publishedFlowResult] = await Promise.all([
    listLeadPage(context, {
      page: requestedPage,
      pageSize: 8,
      search,
      statuses: leadFilterStatuses(status),
    }),
    getLeadListCounts(context),
    hasCapability(context, "flow:read")
      ? supabase
          .from("published_flows")
          .select("public_id")
          .eq("organization_id", organizationId)
          .order("published_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const publishedFlow = publishedFlowResult.data;

  return (
    <main className="panel-workspace lead-panel">
      <PanelPageHeader
        actions={
          <div className="record-header-actions">
            <form action={`/panel/${organizationId}/leady`} className="record-search" method="get">
              {status ? <input name="status" type="hidden" value={status} /> : null}
              <PanelIcon name="search" />
              <label className="wy-sr-only" htmlFor="lead-search">
                Szukaj leadów
              </label>
              <Input
                className="record-search__input"
                defaultValue={search}
                id="lead-search"
                maxLength={80}
                name="q"
                placeholder="Szukaj leadów…"
                type="search"
              />
              <button className="wy-sr-only" type="submit">
                Szukaj
              </button>
            </form>
            {publishedFlow ? (
              <LinkButton
                className="record-primary-action"
                href={`/f/${publishedFlow.public_id}`}
                rel="noreferrer"
                size="small"
                target="_blank"
                variant="primary"
              >
                <PanelIcon name="plus" />
                Nowy lead
              </LinkButton>
            ) : null}
          </div>
        }
        breadcrumbs={[{ href: `/panel/${organizationId}`, label: "Przegląd" }, { label: "Leady" }]}
        description="Lista zapytań i ich bieżący status obsługi."
        title="Leady"
      />

      <section aria-label="Lista leadów" className="record-list-surface lead-list-surface">
        <nav
          aria-label="Filtr statusu"
          className="panel-segmented-track record-tabs lead-filters lead-filters--segmented"
        >
          {leadFilters.map((item) => (
            <Link
              aria-current={status === item.key ? "page" : undefined}
              href={leadListHref(organizationId, { q: search, status: item.key })}
              key={item.key ?? "all"}
            >
              {item.label}
              <span>{leadFilterCount(counts, item.key)}</span>
            </Link>
          ))}
        </nav>

        <div className="record-list-meta">
          <p aria-live="polite">
            <strong>{leadPage.total}</strong> {resultLabel(leadPage.total)}
            {search ? ` dla „${search}”` : ""}
          </p>
          {leadPage.total > 0 ? (
            <p>
              Strona {leadPage.page} z {leadPage.pageCount}
            </p>
          ) : null}
        </div>

        {leadPage.items.length === 0 ? (
          <div className="record-list-empty lead-list-empty">
            <EmptyState
              description={
                search
                  ? "Zmień wyszukiwaną frazę albo wyczyść filtry."
                  : status
                    ? "Zmień filtr albo wróć do wszystkich leadów."
                    : "Udostępnij opublikowany proces i wyślij testowy lead."
              }
              title={
                search
                  ? "Brak pasujących leadów"
                  : status
                    ? "Brak leadów z tym statusem"
                    : "Nie ma jeszcze leadów"
              }
            />
          </div>
        ) : (
          <>
            <div className="record-table-wrap lead-table-wrap">
              <table className="record-table lead-table">
                <thead>
                  <tr>
                    <th scope="col">Klient</th>
                    <th scope="col">Usługa</th>
                    <th scope="col">Wynik</th>
                    <th scope="col">Budżet</th>
                    <th scope="col">Termin</th>
                    <th scope="col">Status</th>
                    <th scope="col">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {leadPage.items.map((lead) => {
                    const href = `/panel/${organizationId}/leady/${lead.id}`;
                    const contactLabel =
                      lead.contactName ?? lead.contactEmail ?? lead.contactPhone ?? "Klient";
                    return (
                      <tr key={lead.id}>
                        <th scope="row">
                          <span className="lead-contact-cell">
                            <span aria-hidden="true" className="record-avatar">
                              {initials(contactLabel)}
                            </span>
                            <Link href={href}>{contactLabel}</Link>
                          </span>
                        </th>
                        <td>{lead.flowTitle}</td>
                        <td>
                          <strong className="lead-score">
                            {lead.score === null ? "—" : lead.score}
                            {lead.score === null ? null : <small>/100</small>}
                          </strong>
                        </td>
                        <td>
                          {formatLeadBudget(
                            lead.priceMinMinor,
                            lead.priceMaxMinor,
                            lead.priceCurrency,
                          )}
                        </td>
                        <td>{formatTimeline(lead.timelineLabel)}</td>
                        <td>
                          <StatusBadge className="record-status" tone={leadStatusTone(lead.status)}>
                            {listStatusLabel(lead.status)}
                          </StatusBadge>
                        </td>
                        <td>
                          <time dateTime={lead.submittedAt}>
                            {formatLeadDate(lead.submittedAt)}
                          </time>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul aria-label="Leady" className="record-mobile-list lead-mobile-list">
              {leadPage.items.map((lead) => {
                const href = `/panel/${organizationId}/leady/${lead.id}`;
                const contactLabel =
                  lead.contactName ?? lead.contactEmail ?? lead.contactPhone ?? "Klient";
                return (
                  <li key={lead.id}>
                    <article className="lead-mobile-row">
                      <header>
                        <span className="lead-contact-cell">
                          <span aria-hidden="true" className="record-avatar">
                            {initials(contactLabel)}
                          </span>
                          <span>
                            <Link href={href}>{contactLabel}</Link>
                            <small>{lead.flowTitle}</small>
                          </span>
                        </span>
                        <StatusBadge className="record-status" tone={leadStatusTone(lead.status)}>
                          {listStatusLabel(lead.status)}
                        </StatusBadge>
                      </header>
                      <dl>
                        <div>
                          <dt>Wynik</dt>
                          <dd>{lead.score === null ? "—" : `${lead.score}/100`}</dd>
                        </div>
                        <div>
                          <dt>Budżet</dt>
                          <dd>
                            {formatLeadBudget(
                              lead.priceMinMinor,
                              lead.priceMaxMinor,
                              lead.priceCurrency,
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt>Termin</dt>
                          <dd>{formatTimeline(lead.timelineLabel)}</dd>
                        </div>
                      </dl>
                      <footer>
                        <time dateTime={lead.submittedAt}>{formatLeadDate(lead.submittedAt)}</time>
                        <Link aria-label={`Otwórz lead: ${contactLabel}`} href={href}>
                          Otwórz
                          <PanelIcon name="arrow-right" />
                        </Link>
                      </footer>
                    </article>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <PanelPagination
          ariaLabel="Paginacja leadów"
          currentPage={leadPage.page}
          hrefForPage={(page) => leadListHref(organizationId, { page, q: search, status })}
          pageCount={leadPage.pageCount}
        />
      </section>
    </main>
  );
}

function formatLeadBudget(
  minimum: number | null,
  maximum: number | null,
  currency: string | null,
): string {
  if (minimum === null || !currency) return "Nie obliczono";
  const formatter = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 });
  const formattedMinimum = formatter.format(minimum / 100);
  const currencyLabel = currency === "PLN" ? "zł" : currency;
  if (maximum === null || maximum === minimum) return `${formattedMinimum} ${currencyLabel}`;
  return `${formattedMinimum} – ${formatter.format(maximum / 100)} ${currencyLabel}`;
}

function leadListHref(
  organizationId: string,
  input: Readonly<{
    page?: number | undefined;
    q?: string | undefined;
    status?: LeadFilter | undefined;
  }>,
): string {
  const parameters = new URLSearchParams();
  if (input.status) parameters.set("status", input.status);
  if (input.q) parameters.set("q", input.q);
  if (input.page && input.page > 1) parameters.set("page", String(input.page));
  const query = parameters.toString();
  return `/panel/${organizationId}/leady${query ? `?${query}` : ""}`;
}

function searchParamValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseLeadFilter(value: string | undefined): LeadFilter | undefined {
  if (value === "new" || value === "in_progress") return value;
  if (value === "completed" || value === "qualified" || value === "won") return "completed";
  if (value === "rejected" || value === "lost" || value === "spam") return "rejected";
  return undefined;
}

function leadFilterStatuses(filter: LeadFilter | undefined): readonly LeadStatus[] | undefined {
  if (filter === "completed") return ["qualified", "won"];
  if (filter === "rejected") return ["lost", "spam"];
  return filter ? [filter] : undefined;
}

function leadFilterCount(counts: LeadListCounts, filter: LeadFilter | undefined): number {
  if (filter === "new") return counts.new;
  if (filter === "in_progress") return counts.inProgress;
  if (filter === "completed") return counts.completed;
  if (filter === "rejected") return counts.rejected;
  return counts.all;
}

function leadStatusTone(status: LeadStatus): "error" | "info" | "success" | "warning" {
  if (status === "new") return "info";
  if (status === "in_progress") return "warning";
  if (status === "qualified" || status === "won") return "success";
  return "error";
}

function listStatusLabel(status: LeadStatus): string {
  if (status === "in_progress") return "W trakcie";
  if (status === "qualified") return "Zakwalifikowany";
  if (status === "won") return "Zakończony";
  if (status === "lost" || status === "spam") return "Odrzucony";
  return "Nowy";
}

function formatTimeline(value: string | null): string {
  if (!value) return "—";
  return value.replace(/^W ciągu /, "Do ");
}

function formatLeadDate(value: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(new Date(value))
    .replace(",", "");
}

function resultLabel(count: number): string {
  if (count === 1) return "wynik";
  const lastTwo = count % 100;
  const last = count % 10;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return "wyniki";
  return "wyników";
}

function initials(value: string): string {
  return (
    value
      .trim()
      .split(/\s+|@/)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase("pl-PL") ?? "")
      .join("") || "L"
  );
}
