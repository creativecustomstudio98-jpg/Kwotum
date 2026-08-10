import { hasCapability, type LeadStatus } from "@wyceno/database";
import { EmptyState } from "@wyceno/ui";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { requireTenantContext } from "../../../../lib/auth/tenant-context";
import { listLeads } from "../../../../lib/leads/service";
import { createClient } from "../../../../lib/supabase/server";
import { PanelIcon } from "../../panel-icon";

export const metadata: Metadata = { title: "Leady" };
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ organizationId: string }>;
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
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
  const status = parseLeadFilter(query.status);
  const context = await requireTenantContext(organizationId);
  const supabase = await createClient();
  const [allLeads, publishedFlowResult] = await Promise.all([
    listLeads(context),
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
  const search = (query.q ?? "").trim().slice(0, 80);
  const normalizedSearch = search.toLocaleLowerCase("pl-PL");
  const matchingLeads = allLeads.filter(
    (lead) =>
      matchesLeadFilter(lead.status, status) &&
      (!normalizedSearch ||
        lead.contactName?.toLocaleLowerCase("pl-PL").includes(normalizedSearch) ||
        lead.contactEmail.toLocaleLowerCase("pl-PL").includes(normalizedSearch) ||
        lead.flowTitle.toLocaleLowerCase("pl-PL").includes(normalizedSearch)),
  );
  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(matchingLeads.length / pageSize));
  const requestedPage = Number(query.page);
  const currentPage =
    Number.isInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, pageCount) : 1;
  const leads = matchingLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <main className="panel-workspace lead-panel">
      <section aria-labelledby="leads-title" className="lead-list-surface">
        <header className="lead-list-header">
          <h1 id="leads-title">Leady</h1>
          <div className="lead-list-header__actions">
            <form action={`/panel/${organizationId}/leady`} className="panel-search" method="get">
              {status ? <input name="status" type="hidden" value={status} /> : null}
              <PanelIcon name="search" />
              <label className="wy-sr-only" htmlFor="lead-search">
                Szukaj leadów
              </label>
              <input
                defaultValue={search}
                id="lead-search"
                maxLength={80}
                name="q"
                placeholder="Szukaj leadów..."
                type="search"
              />
              <button className="wy-sr-only" type="submit">
                Szukaj
              </button>
            </form>
            {publishedFlow ? (
              <Link
                className="lead-new-link"
                href={`/f/${publishedFlow.public_id}`}
                rel="noreferrer"
                target="_blank"
              >
                <span aria-hidden="true">+</span>
                Nowy lead
              </Link>
            ) : null}
          </div>
        </header>

        <nav aria-label="Filtr statusu" className="lead-filters">
          {leadFilters.map((item) => (
            <Link
              aria-current={status === item.key ? "page" : undefined}
              href={leadListHref(organizationId, { q: search, status: item.key })}
              key={item.key ?? "all"}
            >
              {item.label}
              <span>
                {item.key
                  ? allLeads.filter((lead) => matchesLeadFilter(lead.status, item.key)).length
                  : allLeads.length}
              </span>
            </Link>
          ))}
        </nav>

        {leads.length === 0 ? (
          <div className="lead-list-empty">
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
          <div className="lead-table-wrap">
            <table className="lead-table">
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
                {leads.map((lead) => {
                  const href = `/panel/${organizationId}/leady/${lead.id}`;
                  return (
                    <tr key={lead.id}>
                      <th data-label="Klient" scope="row">
                        <span className="lead-contact-cell">
                          {lead.contactName === "Anna Kowalska" ? (
                            <Image
                              alt=""
                              className="lead-list-avatar"
                              height={28}
                              src="/images/redesign/anna-kowalska-avatar-v1.webp"
                              unoptimized
                              width={28}
                            />
                          ) : (
                            <span className="panel-avatar" aria-hidden="true">
                              {initials(lead.contactName ?? lead.contactEmail)}
                            </span>
                          )}
                          <Link href={href}>{lead.contactName ?? lead.contactEmail}</Link>
                        </span>
                      </th>
                      <td data-label="Usługa">{lead.flowTitle}</td>
                      <td data-label="Wynik">
                        <strong className="lead-score">
                          {lead.score === null ? "—" : lead.score}
                          {lead.score === null ? null : <small>/100</small>}
                        </strong>
                      </td>
                      <td data-label="Budżet">
                        {formatLeadBudget(
                          lead.priceMinMinor,
                          lead.priceMaxMinor,
                          lead.priceCurrency,
                        )}
                      </td>
                      <td data-label="Termin">{formatTimeline(lead.timelineLabel)}</td>
                      <td data-label="Status">
                        <span className={`panel-status panel-status--${lead.status}`}>
                          {listStatusLabel(lead.status)}
                        </span>
                      </td>
                      <td data-label="Data">{formatLeadDate(lead.submittedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {pageCount > 1 ? (
          <nav aria-label="Paginacja leadów" className="panel-pagination">
            <Link
              aria-label="Poprzednia strona"
              aria-disabled={currentPage === 1}
              href={leadListHref(organizationId, {
                page: Math.max(1, currentPage - 1),
                q: search,
                status,
              })}
            >
              ‹
            </Link>
            {paginationItems(currentPage, pageCount).map((item, index) =>
              item === "ellipsis" ? (
                <span aria-hidden="true" className="panel-pagination__ellipsis" key={`e-${index}`}>
                  …
                </span>
              ) : (
                <Link
                  aria-current={item === currentPage ? "page" : undefined}
                  href={leadListHref(organizationId, { page: item, q: search, status })}
                  key={item}
                >
                  {item}
                </Link>
              ),
            )}
            <Link
              aria-label="Następna strona"
              aria-disabled={currentPage === pageCount}
              href={leadListHref(organizationId, {
                page: Math.min(pageCount, currentPage + 1),
                q: search,
                status,
              })}
            >
              ›
            </Link>
          </nav>
        ) : null}
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

function parseLeadFilter(value: string | undefined): LeadFilter | undefined {
  if (value === "new" || value === "in_progress") return value;
  if (value === "completed" || value === "qualified" || value === "won") return "completed";
  if (value === "rejected" || value === "lost" || value === "spam") return "rejected";
  return undefined;
}

function matchesLeadFilter(status: LeadStatus, filter: LeadFilter | undefined): boolean {
  if (!filter) return true;
  if (filter === "completed") return status === "qualified" || status === "won";
  if (filter === "rejected") return status === "lost" || status === "spam";
  return status === filter;
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

function paginationItems(currentPage: number, pageCount: number): Array<number | "ellipsis"> {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1);
  if (currentPage <= 3) return [1, 2, 3, "ellipsis", pageCount];
  if (currentPage >= pageCount - 2) {
    return [1, "ellipsis", pageCount - 2, pageCount - 1, pageCount];
  }
  return [1, "ellipsis", currentPage, "ellipsis", pageCount];
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
