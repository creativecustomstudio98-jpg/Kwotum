import { hasCapability, type LeadStatus } from "@wyceno/database";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { getAnalyticsOverview } from "../../../lib/analytics/service";
import { requireTenantContext } from "../../../lib/auth/tenant-context";
import { getOperationalLeadOverview } from "../../../lib/dashboard/service";
import { listFlowDrafts } from "../../../lib/flows/service";
import { getDashboardAttention, listLeads, type LeadSummary } from "../../../lib/leads/service";
import { getNotificationActivity } from "../../../lib/notifications/activity";
import { relativeTrend, type MetricTrend } from "./dashboard-metrics";
import { DashboardHorizontalBreakdown, DashboardTrendChart } from "./dashboard-visuals";
import { PanelIcon } from "../panel-icon";
import { PanelPageHeader } from "../panel-page-header";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Przegląd",
};
export const dynamic = "force-dynamic";

const sourceLabels: Readonly<Record<string, string>> = {
  direct: "Bezpośrednie",
  email: "E-mail",
  organic: "Wyszukiwarki",
  other: "Inne",
  paid: "Płatne kampanie",
  referral: "Odesłania",
  social: "Social media",
};

export default async function OrganizationDashboard({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const context = await requireTenantContext(organizationId);
  const canReadFlows = hasCapability(context, "flow:read");
  const currentPeriodEnd = new Date();
  const currentPeriodStart = new Date(currentPeriodEnd.getTime() - 30 * 24 * 60 * 60 * 1_000);
  const [latestLeads, operational, attention, analytics, previousAnalytics, flows, notifications] =
    await Promise.all([
      listLeads(context, undefined, 5),
      getOperationalLeadOverview(context, currentPeriodStart, currentPeriodEnd),
      getDashboardAttention(context, currentPeriodEnd),
      getAnalyticsOverview(organizationId, 30, currentPeriodEnd),
      getAnalyticsOverview(organizationId, 30, currentPeriodStart),
      canReadFlows ? listFlowDrafts(context) : Promise.resolve([]),
      getNotificationActivity(context),
    ]);

  const dailySeries = operational.daily.slice(-14).map((point) => ({
    estimateMinor: point.estimateMinor,
    isoDate: point.date,
    label: formatChartDate(point.date),
    leads: point.leads,
    qualityLeads: point.qualityLeads,
  }));
  const statusBreakdown = operational.statuses.map((item) => ({
    ...item,
    label: statusLabel(item.key),
  }));
  const flowBreakdown = operational.flows;
  const estimateBreakdown = operational.estimateBuckets.map((item) => ({
    ...item,
    label: estimateBucketLabel(item.key),
  }));
  const sourceBreakdown = analytics.overview.insufficientData
    ? []
    : analytics.overview.sources.map((source) => ({
        ...source,
        label: sourceLabels[source.key] ?? "Inne",
      }));
  const attentionLeadCount = attention.count;
  const attentionLeads = attention.items;
  const publishedFlows = flows.filter((flow) => flow.status === "published");
  const dateRange = formatDateRange(analytics.overview.period);

  return (
    <main className="panel-workspace dashboard-panel">
      <PanelPageHeader
        actions={
          <div className="dashboard-header-actions">
            <form
              action={`/panel/${organizationId}/leady`}
              className="dashboard-search"
              method="get"
            >
              <PanelIcon name="search" />
              <label className="wy-sr-only" htmlFor="dashboard-search">
                Szukaj leadów
              </label>
              <input
                id="dashboard-search"
                maxLength={80}
                name="q"
                placeholder="Szukaj leadów..."
                type="search"
              />
              <button className="wy-sr-only" type="submit">
                Szukaj
              </button>
            </form>
            <Link
              aria-label={`Otwórz analitykę dla okresu ${dateRange}`}
              className="dashboard-period"
              href={`/panel/${organizationId}/analityka?days=30`}
            >
              <PanelIcon name="calendar" />
              <span>{dateRange}</span>
            </Link>
          </div>
        }
        breadcrumbs={[{ href: "/panel", label: "Organizacje" }, { label: "Przegląd" }]}
        description="Przegląd najważniejszych danych i zadań w organizacji."
        title="Przegląd"
      />

      <div className="panel-page dashboard-page">
        <section
          aria-label="Najważniejsze wskaźniki"
          className="dashboard-surface dashboard-summary"
        >
          <div className="dashboard-metric-grid">
            <Metric
              label="Nowe leady"
              meta={`${analytics.overview.totals.sessions} sesji analitycznych`}
              trend={relativeTrend(operational.totals.leads, operational.previousTotals.leads)}
              value={String(operational.totals.leads)}
            />
            <Metric
              label="Wartość wycen od"
              meta={`${operational.totals.pricedLeads} wycen w PLN`}
              trend={relativeTrend(
                operational.totals.estimateMinor,
                operational.previousTotals.estimateMinor,
              )}
              value={formatDashboardAmount(operational.totals.estimateMinor)}
            />
            <Metric
              label="Konwersja do leada"
              meta="sesja ze zgodą → lead"
              trend={relativeTrend(
                analytics.overview.totals.leadRateBasisPoints,
                previousAnalytics.overview.totals.leadRateBasisPoints,
              )}
              value={percent(analytics.overview.totals.leadRateBasisPoints)}
            />
            <Metric
              attention={attentionLeadCount > 0}
              label="Leady do obsługi"
              meta={
                attentionLeadCount === 0
                  ? "Stan bieżący: brak zaległości"
                  : "Stan bieżący: nowe i zaległe"
              }
              value={String(attentionLeadCount)}
            />
          </div>
          <div className="dashboard-summary-meta">
            <p>
              <span>Mediana do wyniku</span>
              <strong>{duration(analytics.overview.totals.medianCompletionSeconds)}</strong>
            </p>
            <p>
              <span>{canReadFlows ? "Opublikowane procesy" : "Wyniki procesów"}</span>
              <strong>
                {canReadFlows
                  ? `${publishedFlows.length} z ${flows.length}`
                  : analytics.overview.totals.results}
              </strong>
            </p>
            <small>KPI okresowe: ostatnie 30 dni</small>
          </div>
        </section>

        <div className="dashboard-focus-grid">
          <DashboardCard
            action={
              <Link className="dashboard-card-link" href={`/panel/${organizationId}/analityka`}>
                Pełna analityka
              </Link>
            }
            className="dashboard-card--trend"
            description="Ostatnie 14 dni · dane operacyjne"
            id="dashboard-trend-title"
            title="Leady w czasie"
          >
            <DashboardTrendChart points={dailySeries} />
          </DashboardCard>

          <DashboardCard
            action={
              <Link className="dashboard-card-link" href={`/panel/${organizationId}/leady`}>
                Zobacz listę
              </Link>
            }
            className="dashboard-card--activity"
            id="dashboard-attention-title"
            title="Wymagają uwagi"
          >
            <div className="dashboard-activity-count">
              <strong>{attentionLeadCount}</strong>
              <span>{attentionLeadCount === 1 ? "lead do obsługi" : "leadów do obsługi"}</span>
            </div>
            {attentionLeads.length === 0 ? (
              <DashboardEmpty
                compact
                description="Nowe i zaległe zgłoszenia pojawią się tutaj."
                title="Wszystko pod kontrolą"
              />
            ) : (
              <ul className="dashboard-attention-list">
                {attentionLeads.map((lead) => (
                  <li key={lead.id}>
                    <Link href={`/panel/${organizationId}/leady/${lead.id}`}>
                      <span aria-hidden="true" className="panel-avatar">
                        {initials(
                          lead.contactName ?? lead.contactEmail ?? lead.contactPhone ?? "Klient",
                        )}
                      </span>
                      <span>
                        <strong>
                          {lead.contactName ?? lead.contactEmail ?? lead.contactPhone ?? "Klient"}
                        </strong>
                        <small>{lead.flowTitle}</small>
                      </span>
                      <span className="dashboard-attention-state">
                        {lead.status === "new" ? "Nowy" : "Zaległy"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="dashboard-activity-divider">
              <span>Ostatnia aktywność</span>
              <Link href={`/panel/${organizationId}/powiadomienia`}>Historia</Link>
            </div>
            {notifications.items.length === 0 ? (
              <p className="dashboard-activity-empty">Brak ostatnich dostaw e-mail.</p>
            ) : (
              <ul className="dashboard-notification-list">
                {notifications.items.slice(0, 2).map((notification) => (
                  <li key={notification.id}>
                    <PanelIcon name="email" />
                    <span>
                      <strong>{notificationKindLabel(notification.kind)}</strong>
                      <small>{notification.recipient}</small>
                    </span>
                    <time dateTime={notification.createdAt}>
                      {relativeDate(notification.createdAt)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>
        </div>

        <DashboardCard
          action={
            <Link className="dashboard-card-link" href={`/panel/${organizationId}/leady`}>
              Zobacz wszystkie
            </Link>
          }
          className="dashboard-card--latest"
          id="dashboard-latest-title"
          title="Najnowsze leady"
        >
          {latestLeads.length === 0 ? (
            <DashboardEmpty
              description="Opublikuj proces i wyślij pierwsze testowe zgłoszenie."
              title="Nie ma jeszcze leadów"
            />
          ) : (
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th scope="col">Klient</th>
                    <th scope="col">Proces</th>
                    <th scope="col">Wartość</th>
                    <th scope="col">Status</th>
                    <th scope="col">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {latestLeads.map((lead) => (
                    <tr key={lead.id}>
                      <th scope="row">
                        <Link
                          className="dashboard-table-contact"
                          href={`/panel/${organizationId}/leady/${lead.id}`}
                        >
                          <span aria-hidden="true" className="panel-avatar">
                            {initials(
                              lead.contactName ??
                                lead.contactEmail ??
                                lead.contactPhone ??
                                "Klient",
                            )}
                          </span>
                          <span>
                            <strong>
                              {lead.contactName ??
                                lead.contactEmail ??
                                lead.contactPhone ??
                                "Klient"}
                            </strong>
                            <small>
                              {lead.score === null ? "Bez score" : `Score ${lead.score}`}
                            </small>
                          </span>
                        </Link>
                      </th>
                      <td>{lead.flowTitle}</td>
                      <td>{formatLeadBudget(lead)}</td>
                      <td>
                        <span className="dashboard-status-text" data-status={lead.status}>
                          {statusLabel(lead.status)}
                        </span>
                      </td>
                      <td>
                        <time dateTime={lead.submittedAt}>{relativeDate(lead.submittedAt)}</time>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          className="dashboard-card--insights"
          description="Leady i sesje analityczne z tego samego okresu"
          id="dashboard-insights-title"
          title="Przekroje z 30 dni"
        >
          <div className="dashboard-insights-grid">
            <DashboardInsight title="Statusy">
              {statusBreakdown.length === 0 ? (
                <DashboardInlineEmpty>Brak leadów w okresie.</DashboardInlineEmpty>
              ) : (
                <DashboardHorizontalBreakdown items={statusBreakdown} />
              )}
            </DashboardInsight>
            <DashboardInsight title="Źródła sesji ze zgodą">
              {analytics.overview.insufficientData ? (
                <DashboardInlineEmpty>
                  Potrzeba minimum {analytics.overview.minimumSampleSize} sesji ze zgodą.
                </DashboardInlineEmpty>
              ) : (
                <>
                  <DashboardHorizontalBreakdown items={sourceBreakdown} />
                  <p className="dashboard-insight-note">
                    Ze względu na prywatność pokazujemy kategorie z minimum 5 sesjami.
                  </p>
                </>
              )}
            </DashboardInsight>
            <DashboardInsight title="Najaktywniejsze procesy">
              {flowBreakdown.length === 0 ? (
                <DashboardInlineEmpty>Ranking pojawi się po zebraniu leadów.</DashboardInlineEmpty>
              ) : (
                <DashboardHorizontalBreakdown items={flowBreakdown} />
              )}
            </DashboardInsight>
            <DashboardInsight title="Przedziały wycen">
              {estimateBreakdown.length === 0 ? (
                <DashboardInlineEmpty>Brak wycen w PLN w tym okresie.</DashboardInlineEmpty>
              ) : (
                <DashboardHorizontalBreakdown items={estimateBreakdown} />
              )}
            </DashboardInsight>
          </div>
        </DashboardCard>
      </div>
    </main>
  );
}

function DashboardCard({
  action,
  children,
  className,
  description,
  id,
  title,
}: Readonly<{
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: string;
  id: string;
  title: string;
}>) {
  return (
    <section
      aria-labelledby={id}
      className={`dashboard-surface dashboard-card${className ? ` ${className}` : ""}`}
    >
      <div className="dashboard-card__header">
        <div>
          <h2 id={id}>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Metric({
  attention = false,
  label,
  meta,
  trend,
  value,
}: Readonly<{
  attention?: boolean;
  label: string;
  meta: string;
  trend?: MetricTrend | null;
  value: string;
}>) {
  return (
    <article className="dashboard-metric-card" data-attention={attention || undefined}>
      <p className="dashboard-metric-card__label">{label}</p>
      <div className="dashboard-metric-card__value-row">
        <strong className="dashboard-metric-card__value">{value}</strong>
        <MetricTrendLabel trend={trend} />
      </div>
      <small>{meta}</small>
    </article>
  );
}

function MetricTrendLabel({ trend }: Readonly<{ trend: MetricTrend | null | undefined }>) {
  return trend ? (
    <span
      aria-label={`${trend.favorable ? "Korzystna" : "Niekorzystna"} zmiana: ${trend.label}`}
      className="dashboard-metric-trend"
      data-tone={trend.favorable ? "positive" : "negative"}
    >
      {trend.label}
    </span>
  ) : null;
}

function DashboardEmpty({
  compact = false,
  description,
  title,
}: Readonly<{ compact?: boolean; description: string; title: string }>) {
  return (
    <div className="dashboard-compact-state" data-compact={compact || undefined}>
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

function DashboardInsight({ children, title }: Readonly<{ children: ReactNode; title: string }>) {
  return (
    <section className="dashboard-insight">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function DashboardInlineEmpty({ children }: Readonly<{ children: ReactNode }>) {
  return <p className="dashboard-inline-empty">{children}</p>;
}

function percent(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("pl-PL", {
    maximumFractionDigits: 1,
    style: "percent",
  }).format(value / 10_000);
}

function duration(seconds: number | null): string {
  if (seconds === null) return "—";
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder === 0 ? `${minutes} min` : `${minutes} min ${remainder} s`;
}

function formatDashboardAmount(valueMinor: number): string {
  if (valueMinor === 0) return "—";
  const value = valueMinor / 100;
  if (value >= 1_000_000) {
    return `${new Intl.NumberFormat("pl-PL", {
      maximumFractionDigits: 2,
    }).format(value / 1_000_000)} mln zł`;
  }
  return `${new Intl.NumberFormat("pl-PL", {
    maximumFractionDigits: 0,
  }).format(value)} zł`;
}

function formatLeadBudget(lead: LeadSummary): string {
  if (lead.priceMinMinor === null || lead.priceCurrency === null) return "Nie obliczono";
  const currency = lead.priceCurrency === "PLN" ? "zł" : lead.priceCurrency;
  const formatter = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 });
  const minimum = formatter.format(lead.priceMinMinor / 100);
  if (lead.priceMaxMinor === null || lead.priceMaxMinor === lead.priceMinMinor) {
    return `${minimum} ${currency}`;
  }
  return `${minimum} – ${formatter.format(lead.priceMaxMinor / 100)} ${currency}`;
}

function statusLabel(status: LeadStatus): string {
  if (status === "in_progress") return "W trakcie";
  if (status === "qualified") return "Zakwalifikowany";
  if (status === "won") return "Wygrany";
  if (status === "lost") return "Utracony";
  if (status === "spam") return "Spam";
  return "Nowy";
}

function estimateBucketLabel(key: "10-20" | "20-40" | "40-80" | "above-80" | "below-10"): string {
  if (key === "below-10") return "poniżej 10 000 zł";
  if (key === "10-20") return "10 000 – 19 999 zł";
  if (key === "20-40") return "20 000 – 39 999 zł";
  if (key === "40-80") return "40 000 – 79 999 zł";
  return "80 000 zł i więcej";
}

function formatChartDate(value: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
    .format(new Date(`${value}T00:00:00.000Z`))
    .replace(".", "");
}

function notificationKindLabel(kind: "lead_company_alert" | "lead_customer_confirmation") {
  return kind === "lead_company_alert" ? "Nowy lead dla firmy" : "Potwierdzenie dla klienta";
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

function relativeDate(value: string): string {
  const milliseconds = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(milliseconds / 60_000));
  if (minutes < 60) return `${minutes} min temu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} godz. temu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 dzień temu";
  if (days < 7) return `${days} dni temu`;
  return new Intl.DateTimeFormat("pl-PL", { dateStyle: "short" }).format(new Date(value));
}

function formatDateRange(period: Readonly<{ from: string; to: string }>): string {
  const formatter = new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${formatter.format(new Date(period.from))} – ${formatter.format(new Date(period.to))}`;
}
