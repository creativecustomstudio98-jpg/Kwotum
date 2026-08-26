import type { CSSProperties } from "react";

import type { DashboardBreakdown, DashboardDailyPoint } from "./dashboard-metrics";

const chartWidth = 760;
const chartHeight = 300;
const chartPadding = { bottom: 42, left: 50, right: 16, top: 20 } as const;
const maximumAxisLabels = 7;
const maximumYAxisLabels = 5;

export function DashboardTrendChart({
  points,
}: Readonly<{ points: ReadonlyArray<DashboardDailyPoint> }>) {
  const highestValue = Math.max(...points.flatMap((point) => [point.leads, point.qualityLeads]), 0);

  if (points.length === 0 || highestValue === 0) {
    return (
      <div className="dashboard-compact-state">
        <strong>Brak leadów w tym okresie</strong>
        <span>Trend pojawi się po zebraniu pierwszych zgłoszeń.</span>
      </div>
    );
  }

  const scale = buildYAxisScale(highestValue);
  const plotBottom = chartHeight - chartPadding.bottom;
  const plotHeight = plotBottom - chartPadding.top;
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const step = plotWidth / Math.max(points.length, 1);
  const barWidth = Math.min(24, Math.max(4, step * 0.34));
  const pairGap = Math.min(4, Math.max(2, step * 0.06));
  const dateLabelIndexes = new Set(evenlySpacedIndexes(points.length, maximumAxisLabels));

  return (
    <figure
      aria-label="Wykres leadów. Na wąskim ekranie przewiń poziomo, aby zobaczyć wszystkie dni."
      className="dashboard-chart"
      tabIndex={0}
    >
      <div aria-label="Legenda wykresu" className="dashboard-chart__legend" role="list">
        <span data-tone="neutral" role="listitem">
          Wszystkie leady
        </span>
        <span data-tone="green" role="listitem">
          Leady jakościowe (80+)
        </span>
      </div>

      <p className="dashboard-chart__mobile-hint">Przesuń wykres, aby zobaczyć kolejne dni.</p>

      <svg
        aria-hidden="true"
        className="dashboard-trend-chart"
        focusable="false"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        {scale.ticks.map((tick) => {
          const y = plotBottom - (tick / scale.maximum) * plotHeight;
          return (
            <g key={tick}>
              <line
                className="dashboard-chart__grid"
                x1={chartPadding.left}
                x2={chartWidth - chartPadding.right}
                y1={y}
                y2={y}
              />
              <text
                className="dashboard-chart__axis"
                style={{ fontSize: "11px" }}
                textAnchor="end"
                x={chartPadding.left - 10}
                y={y + 4}
              >
                {formatCount(tick)}
              </text>
            </g>
          );
        })}

        {points.map((point, index) => {
          const groupCenter = chartPadding.left + index * step + step / 2;
          const leadHeight = (point.leads / scale.maximum) * plotHeight;
          const qualityHeight = (point.qualityLeads / scale.maximum) * plotHeight;

          return (
            <g key={point.isoDate}>
              <title>{`${point.label}: ${point.leads} wszystkich leadów, ${point.qualityLeads} jakościowych`}</title>
              <rect
                className="dashboard-trend-chart__bar is-all"
                height={leadHeight}
                rx="2"
                width={barWidth}
                x={groupCenter - barWidth - pairGap / 2}
                y={plotBottom - leadHeight}
              />
              <rect
                className="dashboard-trend-chart__bar is-quality"
                height={qualityHeight}
                rx="2"
                width={barWidth}
                x={groupCenter + pairGap / 2}
                y={plotBottom - qualityHeight}
              />
              {dateLabelIndexes.has(index) ? (
                <text
                  className="dashboard-chart__axis dashboard-chart__axis--date"
                  style={{ fontSize: "11px" }}
                  textAnchor="middle"
                  x={groupCenter}
                  y={chartHeight - 12}
                >
                  {point.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      <figcaption className="wy-sr-only">
        Dzienna liczba wszystkich leadów oraz leadów jakościowych z wynikiem co najmniej 80.
      </figcaption>
      <table className="wy-sr-only">
        <caption>Dane przedstawione na wykresie trendu leadów</caption>
        <thead>
          <tr>
            <th scope="col">Dzień</th>
            <th scope="col">Wszystkie leady</th>
            <th scope="col">Leady jakościowe (80+)</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.isoDate}>
              <th scope="row">
                <time dateTime={point.isoDate}>{point.label}</time>
              </th>
              <td>{point.leads}</td>
              <td>{point.qualityLeads}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function DashboardHorizontalBreakdown({
  items,
}: Readonly<{ items: ReadonlyArray<DashboardBreakdown> }>) {
  if (items.length === 0) {
    return (
      <div className="dashboard-compact-state">
        <strong>Brak danych w tym okresie</strong>
        <span>Podział pojawi się po zebraniu kolejnych rekordów.</span>
      </div>
    );
  }

  return (
    <ul className="dashboard-horizontal-breakdown">
      {items.map((item) => {
        const share = Math.min(Math.max(item.shareBasisPoints / 100, 0), 100);
        return (
          <li key={item.key}>
            <span>{item.label}</span>
            <div aria-hidden="true">
              <i style={{ "--dashboard-bar": `${share}%` } as CSSProperties} />
            </div>
            <strong>{item.count}</strong>
            <span className="dashboard-horizontal-breakdown__share">
              {percent(item.shareBasisPoints)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function buildYAxisScale(maximum: number): Readonly<{ maximum: number; ticks: number[] }> {
  const safeMaximum = Math.max(Math.ceil(maximum), 1);

  if (safeMaximum < maximumYAxisLabels) {
    return {
      maximum: safeMaximum,
      ticks: Array.from({ length: safeMaximum + 1 }, (_, index) => index),
    };
  }

  const step = niceCeiling(safeMaximum / (maximumYAxisLabels - 1));
  const scaleMaximum = Math.ceil(safeMaximum / step) * step;
  const intervalCount = Math.round(scaleMaximum / step);

  return {
    maximum: scaleMaximum,
    ticks: Array.from({ length: intervalCount + 1 }, (_, index) => index * step),
  };
}

function niceCeiling(value: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const multiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return multiplier * magnitude;
}

function evenlySpacedIndexes(length: number, maximumLabels: number): number[] {
  if (length <= 0) return [];
  if (length <= maximumLabels) return Array.from({ length }, (_, index) => index);

  return [
    ...new Set(
      Array.from({ length: maximumLabels }, (_, index) =>
        Math.round((index * (length - 1)) / (maximumLabels - 1)),
      ),
    ),
  ];
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(value);
}

function percent(value: number): string {
  return new Intl.NumberFormat("pl-PL", {
    maximumFractionDigits: 0,
    style: "percent",
  }).format(value / 10_000);
}
