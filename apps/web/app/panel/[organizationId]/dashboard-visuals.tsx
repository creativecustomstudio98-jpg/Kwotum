import type { CSSProperties } from "react";

import type { DashboardBreakdown, DashboardDailyPoint } from "./dashboard-metrics";

const chartWidth = 620;
const chartHeight = 210;
const chartPadding = { bottom: 28, left: 38, right: 12, top: 12 } as const;

export function DashboardSparkline({
  points,
  tone = "green",
}: Readonly<{ points: ReadonlyArray<number>; tone?: "blue" | "green" }>) {
  const maximum = Math.max(...points, 1);
  const width = 84;
  const height = 34;
  const polyline = points
    .map((point, index) => {
      const x = points.length <= 1 ? width / 2 : (index / (points.length - 1)) * width;
      const y = height - 3 - (point / maximum) * (height - 8);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      aria-hidden="true"
      className="dashboard-sparkline"
      data-tone={tone}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline points={polyline} />
    </svg>
  );
}

export function DashboardTrendChart({
  points,
}: Readonly<{ points: ReadonlyArray<DashboardDailyPoint> }>) {
  const maximum = Math.max(...points.map((point) => point.leads), 1);
  const qualityMaximum = Math.max(maximum, ...points.map((point) => point.qualityLeads));
  const allPoints = chartPoints(
    points.map((point) => point.leads),
    qualityMaximum,
  );
  const qualityPoints = chartPoints(
    points.map((point) => point.qualityLeads),
    qualityMaximum,
  );
  const chartBottom = chartHeight - chartPadding.bottom;
  const areaPath = `M ${allPoints[0]?.x ?? chartPadding.left} ${chartBottom} ${allPoints
    .map((point) => `L ${point.x} ${point.y}`)
    .join(" ")} L ${allPoints.at(-1)?.x ?? chartWidth - chartPadding.right} ${chartBottom} Z`;
  const horizontalGuides = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    return {
      value: Math.round(qualityMaximum * (1 - ratio)),
      y: chartPadding.top + ratio * (chartBottom - chartPadding.top),
    };
  });

  return (
    <div className="dashboard-chart">
      <div className="dashboard-chart__legend" aria-hidden="true">
        <span data-tone="green">Wszystkie leady</span>
        <span data-tone="blue">Jakościowe (80+)</span>
      </div>
      <svg
        aria-label={`Leady w czasie. ${points
          .map((point) => `${point.label}: ${point.leads}, jakościowe: ${point.qualityLeads}`)
          .join("; ")}`}
        className="dashboard-trend-chart"
        role="img"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        {horizontalGuides.map((guide) => (
          <g key={guide.y}>
            <line
              className="dashboard-chart__grid"
              x1={chartPadding.left}
              x2={chartWidth - chartPadding.right}
              y1={guide.y}
              y2={guide.y}
            />
            <text className="dashboard-chart__axis" x={chartPadding.left - 8} y={guide.y + 3}>
              {guide.value}
            </text>
          </g>
        ))}
        <path className="dashboard-trend-chart__area" d={areaPath} />
        <polyline
          className="dashboard-trend-chart__line is-all"
          points={allPoints.map((point) => `${point.x},${point.y}`).join(" ")}
        />
        <polyline
          className="dashboard-trend-chart__line is-quality"
          points={qualityPoints.map((point) => `${point.x},${point.y}`).join(" ")}
        />
        {allPoints.map((point, index) =>
          index % 5 === 0 || index === allPoints.length - 1 ? (
            <text
              className="dashboard-chart__axis dashboard-chart__axis--date"
              key={points[index]?.isoDate}
              textAnchor={index === 0 ? "start" : index === allPoints.length - 1 ? "end" : "middle"}
              x={point.x}
              y={chartHeight - 7}
            >
              {points[index]?.label}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}

export function DashboardEstimateChart({
  points,
}: Readonly<{ points: ReadonlyArray<DashboardDailyPoint> }>) {
  const maximum = Math.max(...points.map((point) => point.estimateMinor), 1);
  const chartBottom = chartHeight - chartPadding.bottom;
  const chartTop = chartPadding.top;
  const plotHeight = chartBottom - chartTop;
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const step = plotWidth / points.length;
  const barWidth = Math.max(5, Math.min(12, step * 0.48));
  const horizontalGuides = Array.from({ length: 4 }, (_, index) => {
    const ratio = index / 3;
    return {
      value: maximum * (1 - ratio),
      y: chartTop + ratio * plotHeight,
    };
  });

  return (
    <svg
      aria-label={`Minimalna wartość wycen według dnia. ${points
        .map((point) => `${point.label}: ${formatCompactAmount(point.estimateMinor)}`)
        .join("; ")}`}
      className="dashboard-estimate-chart"
      role="img"
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
    >
      {horizontalGuides.map((guide) => (
        <g key={guide.y}>
          <line
            className="dashboard-chart__grid"
            x1={chartPadding.left}
            x2={chartWidth - chartPadding.right}
            y1={guide.y}
            y2={guide.y}
          />
          <text className="dashboard-chart__axis" x={chartPadding.left - 8} y={guide.y + 3}>
            {formatCompactAmount(guide.value)}
          </text>
        </g>
      ))}
      {points.map((point, index) => {
        const height = point.estimateMinor === 0 ? 0 : (point.estimateMinor / maximum) * plotHeight;
        const x = chartPadding.left + index * step + (step - barWidth) / 2;
        return (
          <g key={point.isoDate}>
            <rect
              className="dashboard-estimate-chart__bar"
              height={height}
              rx={barWidth / 2}
              width={barWidth}
              x={x}
              y={chartBottom - height}
            />
            {index % 5 === 0 || index === points.length - 1 ? (
              <text
                className="dashboard-chart__axis dashboard-chart__axis--date"
                textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}
                x={
                  index === 0
                    ? chartPadding.left
                    : index === points.length - 1
                      ? chartWidth - chartPadding.right
                      : x + barWidth / 2
                }
                y={chartHeight - 7}
              >
                {point.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function DashboardDonut({
  centerLabel = "łącznie",
  items,
}: Readonly<{ centerLabel?: string; items: ReadonlyArray<DashboardBreakdown> }>) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <div className="dashboard-compact-state">
        <strong>Brak danych w tym okresie</strong>
        <span>Wykres uzupełni się po zebraniu kolejnych rekordów.</span>
      </div>
    );
  }

  return (
    <div className="dashboard-donut">
      <div className="dashboard-donut__graphic">
        <svg
          aria-label={items
            .map((item) => `${item.label}: ${item.count}, ${percent(item.shareBasisPoints)}`)
            .join("; ")}
          role="img"
          viewBox="0 0 120 120"
        >
          <circle className="dashboard-donut__track" cx="60" cy="60" r="46" />
          {items.map((item, index) => {
            const share = (item.count / total) * 100;
            const dashOffset = -items
              .slice(0, index)
              .reduce((offset, previous) => offset + (previous.count / total) * 100, 0);
            return (
              <circle
                className="dashboard-donut__segment"
                cx="60"
                cy="60"
                data-tone={index % 6}
                key={item.key}
                pathLength="100"
                r="46"
                strokeDasharray={`${Math.max(share - 0.8, 0)} ${100 - Math.max(share - 0.8, 0)}`}
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </svg>
        <span>
          <strong>{total}</strong>
          <small>{centerLabel}</small>
        </span>
      </div>
      <ul className="dashboard-donut__legend">
        {items.map((item, index) => (
          <li key={item.key}>
            <i aria-hidden="true" data-tone={index % 6} />
            <span>{item.label}</span>
            <strong>{item.count}</strong>
            <small>{percent(item.shareBasisPoints)}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DashboardHorizontalBreakdown({
  items,
}: Readonly<{ items: ReadonlyArray<DashboardBreakdown> }>) {
  const maximum = Math.max(...items.map((item) => item.count), 1);

  return (
    <ul className="dashboard-horizontal-breakdown">
      {items.map((item) => (
        <li key={item.key}>
          <span>{item.label}</span>
          <div aria-hidden="true">
            <i style={{ "--dashboard-bar": `${(item.count / maximum) * 100}%` } as CSSProperties} />
          </div>
          <strong>{item.count}</strong>
          <small>{percent(item.shareBasisPoints)}</small>
        </li>
      ))}
    </ul>
  );
}

function chartPoints(values: ReadonlyArray<number>, maximum: number) {
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  return values.map((value, index) => ({
    x:
      chartPadding.left +
      (values.length <= 1 ? plotWidth / 2 : (index / (values.length - 1)) * plotWidth),
    y: chartPadding.top + plotHeight - (value / maximum) * plotHeight,
  }));
}

function percent(value: number): string {
  return new Intl.NumberFormat("pl-PL", {
    maximumFractionDigits: 0,
    style: "percent",
  }).format(value / 10_000);
}

function formatCompactAmount(valueMinor: number): string {
  const value = valueMinor / 100;
  if (value >= 1_000_000) {
    return `${new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 1 }).format(value / 1_000_000)} mln`;
  }
  if (value >= 1_000) {
    return `${new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(value / 1_000)}k`;
  }
  return String(Math.round(value));
}
