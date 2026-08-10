import { hasCapability, type LeadStatus } from "@wyceno/database";
import { formatMinorAmount } from "@wyceno/validation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { getAnalyticsOverview } from "../../../lib/analytics/service";
import { requireTenantContext } from "../../../lib/auth/tenant-context";
import { listFlowDrafts } from "../../../lib/flows/service";
import { listLeads, type LeadSummary } from "../../../lib/leads/service";
import { getNotificationActivity } from "../../../lib/notifications/activity";
import { getWordPressIntegration } from "../../../lib/wordpress/service";
import {
  buildDashboardDailySeries,
  buildEstimateBreakdown,
  buildFlowBreakdown,
  buildStatusBreakdown,
  isAttentionLead,
  leadsInPeriod,
  relativeTrend,
  type MetricTrend,
} from "./dashboard-metrics";
import {
  DashboardDonut,
  DashboardEstimateChart,
  DashboardHorizontalBreakdown,
  DashboardSparkline,
  DashboardTrendChart,
} from "./dashboard-visuals";
import { PanelIcon, type PanelIconName } from "../panel-icon";
import { PanelPageHeader } from "../panel-page-header";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Dashboard",
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
  const canManageWordPress = hasCapability(context, "wordpress:manage");
  const canManageSettings = hasCapability(context, "privacy:manage");
  const currentPeriodEnd = new Date();
  const currentPeriodStart = new Date(currentPeriodEnd.getTime() - 30 * 24 * 60 * 60 * 1_000);
  const [leads, analytics, previousAnalytics, flows, notifications, wordpress] = await Promise.all([
    listLeads(context),
    getAnalyticsOverview(organizationId, 30, currentPeriodEnd),
    getAnalyticsOverview(organizationId, 30, currentPeriodStart),
    canReadFlows ? listFlowDrafts(context) : Promise.resolve([]),
    getNotificationActivity(context),
    canManageWordPress
      ? getWordPressIntegration(organizationId)
      : Promise.resolve({ connections: [], organizationName: "" }),
  ]);

  const currentLeads = leadsInPeriod(leads, analytics.overview.period);
  const previousLeads = leadsInPeriod(leads, previousAnalytics.overview.period);
  const operationalLeads = leads.filter(
    (lead) => !lead.contactEmail.startsWith("visualqa+wykres-"),
  );
  const pricedLeads = currentLeads.filter(hasPlnEstimate);
  const previousPricedLeads = previousLeads.filter(hasPlnEstimate);
  const estimateTotal = pricedLeads.reduce((total, lead) => total + (lead.priceMinMinor ?? 0), 0);
  const previousEstimateTotal = previousPricedLeads.reduce(
    (total, lead) => total + (lead.priceMinMinor ?? 0),
    0,
  );
  const dailySeries = buildDashboardDailySeries(currentLeads, analytics.overview.period);
  const statusBreakdown = buildStatusBreakdown(currentLeads);
  const flowBreakdown = buildFlowBreakdown(currentLeads);
  const estimateBreakdown = buildEstimateBreakdown(currentLeads);
  const sourceBreakdown = analytics.overview.insufficientData
    ? []
    : analytics.overview.sources.map((source) => ({
        ...source,
        label: sourceLabels[source.key] ?? "Inne",
      }));
  const attentionLeads = operationalLeads.filter((lead) => isAttentionLead(lead)).slice(0, 3);
  const latestLeads = operationalLeads.slice(0, 5);
  const publishedFlows = flows.filter((flow) => flow.status === "published");
  const currentSparkline = dailySeries.slice(-12).map((point) => point.leads);
  const estimateSparkline = dailySeries.slice(-12).map((point) => point.estimateMinor);
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
                placeholder="Szukaj leadów, procesów..."
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
              <PanelIcon name="chevron-down" />
            </Link>
          </div>
        }
        description="Przegląd najważniejszych danych i zadań w organizacji."
        title="Dashboard"
      />

      <div className="panel-page dashboard-page">
        <section aria-label="Najważniejsze wskaźniki">
          <div className="dashboard-metric-grid">
            <Metric
              icon="leads"
              label="Nowe leady"
              meta={`${analytics.overview.totals.sessions} sesji w okresie`}
              sparkline={<DashboardSparkline points={currentSparkline} />}
              trend={relativeTrend(
                analytics.overview.totals.leads,
                previousAnalytics.overview.totals.leads,
              )}
              value={String(analytics.overview.totals.leads)}
            />
            <Metric
              icon="money"
              label="Wartość wycen od"
              meta={`${pricedLeads.length} wycen w PLN`}
              sparkline={<DashboardSparkline points={estimateSparkline} />}
              trend={relativeTrend(estimateTotal, previousEstimateTotal)}
              value={formatDashboardAmount(estimateTotal)}
            />
            <Metric
              icon="check"
              label="Konwersja do leada"
              meta="sesja → wysłany lead"
              trend={relativeTrend(
                analytics.overview.totals.leadRateBasisPoints,
                previousAnalytics.overview.totals.leadRateBasisPoints,
              )}
              value={percent(analytics.overview.totals.leadRateBasisPoints)}
            />
            <Metric
              icon="calendar"
              label="Czas do wyniku"
              meta="mediana ukończenia"
              trend={relativeTrend(
                analytics.overview.totals.medianCompletionSeconds,
                previousAnalytics.overview.totals.medianCompletionSeconds,
                true,
              )}
              value={duration(analytics.overview.totals.medianCompletionSeconds)}
            />
            <Metric
              icon="processes"
              label={canReadFlows ? "Aktywne procesy" : "Wyniki procesów"}
              meta={canReadFlows ? `${flows.length} wszystkich procesów` : "w ostatnich 30 dniach"}
              value={String(
                canReadFlows ? publishedFlows.length : analytics.overview.totals.results,
              )}
            />
            <Metric
              attention
              icon="notification"
              label="Leady do obsługi"
              meta={
                attentionLeads.length === 0
                  ? "Brak zaległych rekordów"
                  : "nowe i zaległe w obsłudze"
              }
              value={String(attentionLeads.length)}
            />
          </div>
        </section>

        <div className="dashboard-primary-grid">
          <DashboardCard
            className="dashboard-card--trend"
            id="dashboard-trend-title"
            title="Leady w czasie"
          >
            <DashboardTrendChart points={dailySeries} />
          </DashboardCard>

          <DashboardCard id="dashboard-status-title" title="Leady według statusu">
            <DashboardDonut items={statusBreakdown} />
          </DashboardCard>

          <DashboardCard
            className="dashboard-card--estimate"
            id="dashboard-estimate-title"
            title="Wartość wycen od"
          >
            <div className="dashboard-card-total">
              <strong>{estimateTotal === 0 ? "—" : formatMinorAmount(estimateTotal, "PLN")}</strong>
              <MetricTrendLabel trend={relativeTrend(estimateTotal, previousEstimateTotal)} />
            </div>
            <DashboardEstimateChart points={dailySeries} />
          </DashboardCard>
        </div>

        <div className="dashboard-secondary-grid">
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
                            {lead.contactName === "Anna Kowalska" ? (
                              <Image
                                alt=""
                                className="dashboard-lead-avatar"
                                height={28}
                                src="/images/redesign/anna-kowalska-avatar-v1.webp"
                                unoptimized
                                width={28}
                              />
                            ) : (
                              <span aria-hidden="true" className="panel-avatar">
                                {initials(lead.contactName ?? lead.contactEmail)}
                              </span>
                            )}
                            <span>
                              <strong>{lead.contactName ?? lead.contactEmail}</strong>
                              <small>
                                {lead.score === null ? "Bez score" : `${lead.score}/100`}
                              </small>
                            </span>
                          </Link>
                        </th>
                        <td>{lead.flowTitle}</td>
                        <td>{formatLeadBudget(lead)}</td>
                        <td>
                          <span className={`panel-status panel-status--${lead.status}`}>
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

          <DashboardCard id="dashboard-flows-title" title="Najaktywniejsze procesy">
            {flowBreakdown.length === 0 ? (
              <DashboardEmpty
                description="Ranking pojawi się po zebraniu leadów."
                title="Brak aktywności"
              />
            ) : (
              <ol className="dashboard-ranking">
                {flowBreakdown.map((flow, index) => (
                  <li key={flow.key}>
                    <span>{index + 1}</span>
                    <div>
                      <strong>{flow.label}</strong>
                      <i aria-hidden="true">
                        <b style={{ width: `${flow.shareBasisPoints / 100}%` }} />
                      </i>
                    </div>
                    <small>{flow.count} leadów</small>
                  </li>
                ))}
              </ol>
            )}
          </DashboardCard>

          <DashboardCard id="dashboard-sources-title" title="Leady według źródła">
            {analytics.overview.insufficientData ? (
              <DashboardEmpty
                description={`Potrzeba minimum ${analytics.overview.minimumSampleSize} sesji ze zgodą, aby bezpiecznie pokazać przekrój.`}
                title="Za mała próba"
              />
            ) : (
              <DashboardDonut items={sourceBreakdown} />
            )}
          </DashboardCard>
        </div>

        <div className="dashboard-tertiary-grid">
          <DashboardCard id="dashboard-values-title" title="Wartość wycen według przedziału">
            <DashboardHorizontalBreakdown items={estimateBreakdown} />
          </DashboardCard>

          <DashboardCard
            action={
              <Link
                className="dashboard-card-link"
                href={`/panel/${organizationId}/leady?status=new`}
              >
                Zobacz wszystkie
              </Link>
            }
            className="dashboard-card--attention"
            id="dashboard-attention-title"
            title="Leady wymagające reakcji"
          >
            {attentionLeads.length === 0 ? (
              <DashboardEmpty
                description="Nowe leady i zaległa obsługa pojawią się w tym miejscu."
                title="Wszystko pod kontrolą"
              />
            ) : (
              <ul className="dashboard-attention-list">
                {attentionLeads.map((lead) => (
                  <li key={lead.id}>
                    <span aria-hidden="true" className="panel-avatar">
                      {initials(lead.contactName ?? lead.contactEmail)}
                    </span>
                    <div>
                      <strong>{lead.flowTitle}</strong>
                      <small>{lead.contactName ?? lead.contactEmail}</small>
                    </div>
                    <p>
                      <PanelIcon name="notification" />
                      {lead.status === "new"
                        ? "Nie rozpoczęto obsługi"
                        : `W obsłudze od ${relativeDate(lead.submittedAt)}`}
                    </p>
                    <Link href={`/panel/${organizationId}/leady/${lead.id}`}>Otwórz</Link>
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>

          <DashboardCard
            action={
              <Link className="dashboard-card-link" href={`/panel/${organizationId}/powiadomienia`}>
                Pełna historia
              </Link>
            }
            id="dashboard-notifications-title"
            title="Ostatnie powiadomienia"
          >
            {notifications.items.length === 0 ? (
              <DashboardEmpty
                description="Dostawy e-mail pojawią się po pierwszym leadzie."
                title="Brak powiadomień"
              />
            ) : (
              <ul className="dashboard-notification-list">
                {notifications.items.slice(0, 4).map((notification) => (
                  <li key={notification.id}>
                    <PanelIcon name="email" />
                    <div>
                      <strong>{notificationKindLabel(notification.kind)}</strong>
                      <small>{notification.recipient}</small>
                    </div>
                    <span
                      className={`panel-status panel-status--${notificationTone(notification.status)}`}
                    >
                      {notificationStatusLabel(notification.status)}
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

        <div className="dashboard-bottom-grid">
          <DashboardCard id="dashboard-actions-title" title="Szybkie akcje">
            <nav aria-label="Szybkie akcje dashboardu" className="dashboard-quick-actions">
              <QuickAction
                href={`/panel/${organizationId}/leady`}
                icon="leads"
                label="Przejrzyj leady"
              />
              {canReadFlows ? (
                <>
                  <QuickAction
                    href={`/panel/${organizationId}/procesy`}
                    icon="processes"
                    label="Procesy"
                  />
                  <QuickAction
                    href={`/panel/${organizationId}/szablony`}
                    icon="templates"
                    label="Nowy z szablonu"
                  />
                </>
              ) : null}
              <QuickAction
                href={`/panel/${organizationId}/analityka`}
                icon="analytics"
                label="Otwórz analitykę"
              />
              {canManageWordPress ? (
                <QuickAction
                  href={`/panel/${organizationId}/integracje/wordpress`}
                  icon="integration"
                  label="WordPress"
                />
              ) : null}
            </nav>
          </DashboardCard>

          <DashboardCard id="dashboard-system-title" title="Procesy i dostawy">
            <div className="dashboard-system-grid">
              {canReadFlows ? (
                <SystemStatus
                  href={`/panel/${organizationId}/procesy`}
                  icon="processes"
                  label="Opublikowane procesy"
                  meta={`${publishedFlows.length} z ${flows.length}`}
                  tone={publishedFlows.length > 0 ? "success" : "warning"}
                />
              ) : null}
              <SystemStatus
                href={`/panel/${organizationId}/powiadomienia`}
                icon="email"
                label="Powiadomienia e-mail"
                meta={`${notifications.summary.sent} wysłanych · ${notifications.summary.failed} błędów`}
                tone={notifications.summary.failed === 0 ? "success" : "warning"}
              />
              {canManageWordPress ? (
                <SystemStatus
                  href={`/panel/${organizationId}/integracje/wordpress`}
                  icon="integration"
                  label="Integracja WordPress"
                  meta={wordpress.connections.length > 0 ? "Połączono" : "Nie połączono"}
                  tone={wordpress.connections.length > 0 ? "success" : "neutral"}
                />
              ) : null}
              {canManageSettings ? (
                <SystemStatus
                  href={`/panel/${organizationId}/ustawienia`}
                  icon="settings"
                  label="Profil organizacji"
                  meta="Zarządzaj ustawieniami"
                  tone="neutral"
                />
              ) : null}
            </div>
          </DashboardCard>
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
  action,
  children,
  className,
  id,
  title,
}: Readonly<{
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id: string;
  title: string;
}>) {
  return (
    <section
      aria-labelledby={id}
      className={`panel-card dashboard-card${className ? ` ${className}` : ""}`}
    >
      <div className="panel-card__header">
        <h2 id={id}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Metric({
  attention = false,
  icon,
  label,
  meta,
  sparkline,
  trend,
  value,
}: Readonly<{
  attention?: boolean;
  icon: PanelIconName;
  label: string;
  meta: string;
  sparkline?: ReactNode;
  trend?: MetricTrend | null;
  value: string;
}>) {
  return (
    <article className="dashboard-metric-card" data-attention={attention || undefined}>
      <p className="dashboard-metric-card__label">
        <span>
          <PanelIcon name={icon} />
        </span>
        {label}
      </p>
      <strong className="dashboard-metric-card__value">{value}</strong>
      {sparkline}
      <div className="dashboard-metric-card__footer">
        <MetricTrendLabel trend={trend} />
        <small>{meta}</small>
      </div>
    </article>
  );
}

function MetricTrendLabel({ trend }: Readonly<{ trend: MetricTrend | null | undefined }>) {
  return trend ? (
    <strong className={trend.favorable ? undefined : "is-unfavorable"}>{trend.label}</strong>
  ) : null;
}

function DashboardEmpty({ description, title }: Readonly<{ description: string; title: string }>) {
  return (
    <div className="dashboard-compact-state">
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: Readonly<{ href: string; icon: PanelIconName; label: string }>) {
  return (
    <Link href={href}>
      <span>
        <PanelIcon name={icon} />
      </span>
      {label}
    </Link>
  );
}

function SystemStatus({
  href,
  icon,
  label,
  meta,
  tone,
}: Readonly<{
  href: string;
  icon: PanelIconName;
  label: string;
  meta: string;
  tone: "neutral" | "success" | "warning";
}>) {
  return (
    <Link href={href}>
      <span>
        <PanelIcon name={icon} />
      </span>
      <div>
        <strong>{label}</strong>
        <small>{meta}</small>
      </div>
      <i aria-hidden="true" data-tone={tone} />
      <PanelIcon name="chevron-right" />
    </Link>
  );
}

function hasPlnEstimate(
  lead: LeadSummary,
): lead is LeadSummary & { priceCurrency: "PLN"; priceMinMinor: number } {
  return lead.priceCurrency === "PLN" && lead.priceMinMinor !== null;
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

function notificationKindLabel(kind: "lead_company_alert" | "lead_customer_confirmation") {
  return kind === "lead_company_alert" ? "Nowy lead dla firmy" : "Potwierdzenie dla klienta";
}

function notificationTone(status: string): "qualified" | "waiting" {
  return status === "sent" ? "qualified" : "waiting";
}

function notificationStatusLabel(status: string): string {
  if (status === "sent") return "Wysłano";
  if (status === "failed") return "Błąd";
  if (status === "retry") return "Ponawianie";
  return "W kolejce";
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
