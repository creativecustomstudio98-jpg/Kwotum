import { EmptyState } from "@wyceno/ui";
import { formatMinorAmount } from "@wyceno/validation";
import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

import { getAnalyticsOverview, type AnalyticsPeriodDays } from "../../../../lib/analytics/service";
import { requireTenantContext } from "../../../../lib/auth/tenant-context";
import { listLeads } from "../../../../lib/leads/service";
import { LeadVolumeChart } from "../../panel-data-visuals";
import { PanelPageHeader } from "../../panel-page-header";
import { leadsInPeriod, relativeTrend, type MetricTrend } from "../dashboard-metrics";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Analityka procesu",
};

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ organizationId: string }>;
  searchParams: Promise<{ days?: string }>;
};

const periods: AnalyticsPeriodDays[] = [7, 30, 90];

function selectedPeriod(value: string | undefined): AnalyticsPeriodDays {
  const parsed = Number(value);
  return parsed === 7 || parsed === 90 ? parsed : 30;
}

function percent(basisPoints: number | null): string {
  return basisPoints === null
    ? "—"
    : new Intl.NumberFormat("pl-PL", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
        style: "percent",
      }).format(basisPoints / 10_000);
}

function duration(seconds: number | null): string {
  if (seconds === null) return "—";
  if (seconds < 60) return `${seconds} s`;
  return `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
}

const sourceLabels: Record<string, string> = {
  direct: "Wejścia bezpośrednie",
  email: "E-mail",
  organic: "Wyszukiwarki",
  other: "Inne",
  paid: "Płatne kampanie",
  referral: "Odesłania",
  social: "Social media",
};

const deviceLabels: Record<string, string> = {
  desktop: "Komputer",
  mobile: "Telefon",
  other: "Inne",
  tablet: "Tablet",
};

export default async function AnalyticsPage({ params, searchParams }: PageProps) {
  const { organizationId } = await params;
  const days = selectedPeriod((await searchParams).days);
  const context = await requireTenantContext(organizationId);
  const currentPeriodEnd = new Date();
  const previousPeriodEnd = new Date(currentPeriodEnd.getTime() - days * 24 * 60 * 60 * 1_000);
  const [{ overview }, { overview: previousOverview }, leads] = await Promise.all([
    getAnalyticsOverview(organizationId, days, currentPeriodEnd),
    getAnalyticsOverview(organizationId, days, previousPeriodEnd),
    listLeads(context),
  ]);
  const currentLeads = leadsInPeriod(leads, overview.period);
  const previousLeads = leadsInPeriod(leads, previousOverview.period);
  const scoredLeads = currentLeads.filter((lead) => lead.score !== null);
  const averageScore =
    scoredLeads.length === 0
      ? null
      : Math.round(
          scoredLeads.reduce((total, lead) => total + (lead.score ?? 0), 0) / scoredLeads.length,
        );
  const pricedLeads = currentLeads.filter(
    (lead) => lead.priceMinMinor !== null && lead.priceCurrency === "PLN",
  );
  const previousPricedLeads = previousLeads.filter(
    (lead) => lead.priceMinMinor !== null && lead.priceCurrency === "PLN",
  );
  const averageEstimate =
    pricedLeads.length === 0
      ? null
      : Math.round(
          pricedLeads.reduce((total, lead) => total + (lead.priceMinMinor ?? 0), 0) /
            pricedLeads.length,
        );
  const previousAverageEstimate =
    previousPricedLeads.length === 0
      ? null
      : Math.round(
          previousPricedLeads.reduce((total, lead) => total + (lead.priceMinMinor ?? 0), 0) /
            previousPricedLeads.length,
        );
  const qualityCounts = {
    high: scoredLeads.filter((lead) => (lead.score ?? 0) >= 80).length,
    low: scoredLeads.filter((lead) => (lead.score ?? 0) < 55).length,
    medium: scoredLeads.filter((lead) => {
      const score = lead.score ?? 0;
      return score >= 55 && score < 80;
    }).length,
  };
  const chartDays = Math.min(days, 30);
  const scoreDistributionTotal = overview.scoreDistribution.reduce(
    (total, category) => total + category.count,
    0,
  );
  const funnelStages = [
    {
      count: overview.totals.sessions,
      label: "Sesje",
      rate: overview.totals.sessions === 0 ? null : 10_000,
    },
    {
      count: overview.totals.starts,
      label: "Rozpoczęcia",
      rate: ratioBasisPoints(overview.totals.starts, overview.totals.sessions),
    },
    {
      count: overview.totals.results,
      label: "Wyniki",
      rate: ratioBasisPoints(overview.totals.results, overview.totals.sessions),
    },
    {
      count: overview.totals.leads,
      label: "Leady",
      rate: overview.totals.leadRateBasisPoints,
    },
  ];

  return (
    <main className="panel-workspace analytics-panel">
      <PanelPageHeader
        actions={
          <nav aria-label="Zakres analityki" className="analytics-periods">
            {periods.map((period) => (
              <Link
                aria-current={period === days ? "page" : undefined}
                href={`/panel/${organizationId}/analityka?days=${period}`}
                key={period}
              >
                {period} dni
              </Link>
            ))}
          </nav>
        }
        title="Analityka"
      />

      <div className="panel-page">
        <section aria-label="Podsumowanie okresu">
          <div className="metric-grid">
            <Metric
              description={`${overview.totals.sessions} sesji ze zgodą`}
              label={`Leady (${days} dni)`}
              trend={relativeTrend(overview.totals.leads, previousOverview.totals.leads)}
              value={String(overview.totals.leads)}
            />
            <Metric
              description="sesja → wysłany lead"
              label="Konwersja"
              trend={relativeTrend(
                overview.totals.leadRateBasisPoints,
                previousOverview.totals.leadRateBasisPoints,
              )}
              value={percent(overview.totals.leadRateBasisPoints)}
            />
            <Metric
              description={`${pricedLeads.length} leadów z wyceną w PLN`}
              label="Śr. wartość wyceny"
              trend={relativeTrend(averageEstimate, previousAverageEstimate)}
              value={averageEstimate === null ? "—" : formatMinorAmount(averageEstimate, "PLN")}
            />
            <Metric
              description="mediana od startu do wyniku"
              label="Czas realizacji"
              trend={relativeTrend(
                overview.totals.medianCompletionSeconds,
                previousOverview.totals.medianCompletionSeconds,
                true,
              )}
              value={duration(overview.totals.medianCompletionSeconds)}
            />
          </div>
        </section>

        <div className="dashboard-charts analytics-summary-charts">
          <section className="panel-card" aria-labelledby="analytics-volume-title">
            <div className="panel-card__header">
              <div>
                <h2 id="analytics-volume-title">Liczba leadów</h2>
                <p>Rzeczywiste zgłoszenia z ostatnich {chartDays} dni.</p>
              </div>
            </div>
            <LeadVolumeChart days={chartDays} leads={currentLeads} />
          </section>
          <section className="panel-card" aria-labelledby="analytics-score-title">
            <div className="panel-card__header">
              <div>
                <h2 id="analytics-score-title">Jakość leadów</h2>
                <p>Średni serwerowy score z ostatnich rekordów.</p>
              </div>
            </div>
            <AnalyticsQuality
              high={qualityCounts.high}
              low={qualityCounts.low}
              medium={qualityCounts.medium}
              score={averageScore}
            />
          </section>
        </div>

        {overview.insufficientData ? (
          <section className="panel-card analytics-privacy-state">
            <EmptyState
              description={`Zebrano ${overview.totals.sessions} z ${overview.minimumSampleSize} wymaganych sesji ze zgodą. Wróć po zebraniu większej próby albo wybierz dłuższy okres.`}
              title="Za mało danych dla wykresów"
            />
          </section>
        ) : (
          <>
            <div className="dashboard-charts analytics-details-grid">
              <section className="panel-card analytics-funnel" aria-labelledby="funnel-title">
                <div className="panel-card__header">
                  <div>
                    <h2 id="funnel-title">Lejek procesu</h2>
                    <p>Od sesji do zapisanego leada.</p>
                  </div>
                  <strong className="analytics-median">
                    {duration(overview.totals.medianCompletionSeconds)}
                    <small>mediana do wyniku</small>
                  </strong>
                </div>
                <ol className="analytics-funnel-flow">
                  {funnelStages.map((stage, index) => (
                    <li key={stage.label}>
                      <span className="analytics-funnel-flow__step">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{stage.label}</span>
                      <strong>{stage.count}</strong>
                      <small>{percent(stage.rate)}</small>
                    </li>
                  ))}
                </ol>
              </section>

              <section
                className="panel-card analytics-quality"
                aria-labelledby="score-distribution-title"
              >
                <div className="panel-card__header">
                  <div>
                    <h2 id="score-distribution-title">Rozkład score</h2>
                    <p>Rozkład serwerowych kategorii score.</p>
                  </div>
                </div>
                {overview.scoreDistribution.length === 0 ? (
                  <div className="panel-inline-state">
                    <strong>Brak bezpiecznego rozkładu</strong>
                    <span>Za mało leadów w poszczególnych kategoriach.</span>
                  </div>
                ) : (
                  <ul className="analytics-score-bubbles">
                    {overview.scoreDistribution.map((category, index) => {
                      const share = ratioBasisPoints(category.count, scoreDistributionTotal);
                      return (
                        <li key={category.key}>
                          <div
                            className={`analytics-score-bubbles__disk is-tone-${index % 4}`}
                            role="img"
                            aria-label={`${category.label}: ${category.count}, ${percent(share)}`}
                          >
                            <strong>{category.count}</strong>
                            <small>{percent(share)}</small>
                          </div>
                          <span>{category.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>

            <div className="analytics-grid">
              <WaffleBreakdown
                items={overview.sources.map((item) => ({
                  ...item,
                  label: sourceLabels[item.key] ?? "Inne",
                }))}
                title="Źródła ruchu"
              />
              <WaffleBreakdown
                items={overview.devices.map((item) => ({
                  ...item,
                  label: deviceLabels[item.key] ?? "Inne",
                }))}
                title="Urządzenia"
              />
            </div>

            <div className="analytics-bottom-grid">
              <section className="panel-card analytics-dropoff" aria-labelledby="drop-off-title">
                <div className="panel-card__header">
                  <div>
                    <h2 id="drop-off-title">Drop-off kroków</h2>
                    <p>Miejsca, w których klienci najczęściej kończą proces.</p>
                  </div>
                </div>
                {overview.dropOff.length === 0 ? (
                  <div className="panel-inline-state">
                    <strong>Za mało danych na poziomie kroków</strong>
                    <span>Wybierz dłuższy okres lub wróć po zebraniu większej próby.</span>
                  </div>
                ) : (
                  <ul className="analytics-dropoff-grid">
                    {overview.dropOff.map((step, index) => (
                      <li key={`${step.stepKey}-${index}`}>
                        <div className="analytics-dropoff-grid__header">
                          <strong>{step.title}</strong>
                          <div
                            className={step.dropped === 0 ? "is-safe" : undefined}
                            style={
                              {
                                "--dropoff-angle": `${step.dropRateBasisPoints * 0.036}deg`,
                              } as CSSProperties
                            }
                          >
                            <span>{percent(step.dropRateBasisPoints)}</span>
                            <small>odejść</small>
                          </div>
                        </div>
                        <dl>
                          <div>
                            <dt>Wyświetlenia</dt>
                            <dd>{step.viewed}</dd>
                          </div>
                          <div>
                            <dt>Odpowiedzi</dt>
                            <dd>{step.answered}</dd>
                          </div>
                          <div>
                            <dt>Odejścia</dt>
                            <dd>{step.dropped}</dd>
                          </div>
                        </dl>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="panel-card analytics-versions" aria-labelledby="versions-title">
                <div className="panel-card__header">
                  <div>
                    <h2 id="versions-title">Wersje procesu</h2>
                    <p>Ruch i ukończenia opublikowanych wersji.</p>
                  </div>
                </div>
                {overview.versions.length === 0 ? (
                  <div className="panel-inline-state">
                    <strong>Brak porównywalnych wersji</strong>
                    <span>Za mało danych do pokazania zestawienia.</span>
                  </div>
                ) : (
                  <ul className="analytics-version-grid">
                    {overview.versions.map((version) => (
                      <li key={version.flowVersionId}>
                        <div
                          className="analytics-version-ring"
                          role="img"
                          aria-label={`Wersja ${version.versionNumber}: ${percent(
                            version.completionRateBasisPoints,
                          )} ukończeń`}
                          style={
                            {
                              "--version-angle": `${version.completionRateBasisPoints * 0.036}deg`,
                            } as CSSProperties
                          }
                        >
                          <strong>{percent(version.completionRateBasisPoints)}</strong>
                        </div>
                        <div>
                          <strong>Wersja {version.versionNumber}</strong>
                          <span>{version.sessions} sesji</span>
                          <small>{version.results} wyników</small>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

type BreakdownItem = {
  count: number;
  key: string;
  label: string;
  shareBasisPoints: number;
};

const waffleCellCount = 40;

function WaffleBreakdown({ items, title }: { items: BreakdownItem[]; title: string }) {
  const cumulativeShares = items.reduce<number[]>((shares, item) => {
    shares.push((shares.at(-1) ?? 0) + item.shareBasisPoints);
    return shares;
  }, []);

  return (
    <section className="panel-card analytics-card">
      <div className="panel-card__header">
        <div>
          <h2>{title}</h2>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="panel-inline-state">
          <strong>Za mało danych dla tej grupy</strong>
        </div>
      ) : (
        <div className="analytics-waffle-layout">
          <div aria-hidden="true" className="analytics-waffle">
            {Array.from({ length: waffleCellCount }, (_, cellIndex) => {
              const midpoint = ((cellIndex + 0.5) / waffleCellCount) * 10_000;
              const tone = cumulativeShares.findIndex((share) => midpoint <= share);
              return <i data-tone={tone < 0 ? "empty" : tone % 5} key={cellIndex} />;
            })}
          </div>
          <ul className="analytics-waffle-legend">
            {items.map((item, index) => (
              <li key={item.key}>
                <i aria-hidden="true" data-tone={index % 5} />
                <span>{item.label}</span>
                <strong>{percent(item.shareBasisPoints)}</strong>
                <small>{item.count}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Metric({
  description,
  label,
  trend,
  value,
}: Readonly<{
  description: string;
  label: string;
  trend: MetricTrend | null;
  value: string;
}>) {
  return (
    <article className="metric-card">
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{value}</strong>
      <div className="metric-card__footer">
        <small>{description}</small>
        {trend ? (
          <strong className={trend.favorable ? undefined : "is-unfavorable"}>{trend.label}</strong>
        ) : null}
      </div>
    </article>
  );
}

function AnalyticsQuality({
  high,
  low,
  medium,
  score,
}: Readonly<{ high: number; low: number; medium: number; score: number | null }>) {
  if (score === null) {
    return (
      <div className="panel-inline-state">
        <strong>Brak obliczonych wyników</strong>
        <span>Jakość pojawi się po zapisaniu leadów ze score.</span>
      </div>
    );
  }

  return (
    <div className="dashboard-quality analytics-dashboard-quality">
      <div
        aria-label={`Średni score: ${score} na 100`}
        className="dashboard-quality__ring"
        role="img"
        style={{ "--dashboard-quality": `${score * 3.6}deg` } as CSSProperties}
      >
        <strong>{score}%</strong>
      </div>
      <ul aria-label="Rozkład jakości leadów">
        <li>
          <i className="is-high" />
          Wysoka <span>{high}</span>
        </li>
        <li>
          <i className="is-medium" />
          Średnia <span>{medium}</span>
        </li>
        <li>
          <i className="is-low" />
          Niska <span>{low}</span>
        </li>
      </ul>
    </div>
  );
}

function ratioBasisPoints(value: number, total: number): number | null {
  return total === 0 ? null : Math.round((value / total) * 10_000);
}
