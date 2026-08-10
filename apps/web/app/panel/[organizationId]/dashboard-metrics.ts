export type MetricTrend = Readonly<{ favorable: boolean; label: string }>;

type DashboardLead = Readonly<{
  flowTitle: string;
  priceCurrency: string | null;
  priceMaxMinor: number | null;
  priceMinMinor: number | null;
  score: number | null;
  status: string;
  submittedAt: string;
}>;

export type DashboardDailyPoint = Readonly<{
  estimateMinor: number;
  isoDate: string;
  label: string;
  leads: number;
  qualityLeads: number;
}>;

export type DashboardBreakdown = Readonly<{
  count: number;
  key: string;
  label: string;
  shareBasisPoints: number;
}>;

export function relativeTrend(
  current: number | null,
  previous: number | null,
  lowerIsBetter = false,
): MetricTrend | null {
  if (current === null || previous === null || previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  const label = `${change >= 0 ? "+" : ""}${new Intl.NumberFormat("pl-PL", {
    maximumFractionDigits: 1,
  }).format(change)}%`;
  return {
    favorable: lowerIsBetter ? change <= 0 : change >= 0,
    label,
  };
}

export function leadsInPeriod<T extends { submittedAt: string }>(
  leads: ReadonlyArray<T>,
  period: Readonly<{ from: string; to: string }>,
): T[] {
  const from = new Date(period.from).getTime();
  const to = new Date(period.to).getTime();
  return leads.filter((lead) => {
    const submittedAt = new Date(lead.submittedAt).getTime();
    return submittedAt >= from && submittedAt < to;
  });
}

export function buildDashboardDailySeries(
  leads: ReadonlyArray<DashboardLead>,
  period: Readonly<{ from: string; to: string }>,
  days = 30,
): DashboardDailyPoint[] {
  const formatter = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  const periodEnd = new Date(period.to);
  periodEnd.setUTCHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(periodEnd);
    date.setUTCDate(periodEnd.getUTCDate() - (days - index));
    const nextDate = new Date(date);
    nextDate.setUTCDate(date.getUTCDate() + 1);
    const dailyLeads = leads.filter((lead) => {
      const submittedAt = new Date(lead.submittedAt);
      return submittedAt >= date && submittedAt < nextDate;
    });

    return {
      estimateMinor: dailyLeads.reduce(
        (total, lead) =>
          total +
          (lead.priceCurrency === "PLN" && lead.priceMinMinor !== null ? lead.priceMinMinor : 0),
        0,
      ),
      isoDate: date.toISOString().slice(0, 10),
      label: formatter.format(date).replace(".", ""),
      leads: dailyLeads.length,
      qualityLeads: dailyLeads.filter((lead) => (lead.score ?? 0) >= 80).length,
    };
  });
}

export function buildStatusBreakdown(leads: ReadonlyArray<DashboardLead>): DashboardBreakdown[] {
  const labels: Readonly<Record<string, string>> = {
    in_progress: "W trakcie",
    lost: "Utracone",
    new: "Nowe",
    qualified: "Zakwalifikowane",
    spam: "Spam",
    won: "Wygrane",
  };
  const order = ["new", "in_progress", "qualified", "won", "lost", "spam"];
  const total = leads.length;

  return order.flatMap((key) => {
    const count = leads.filter((lead) => lead.status === key).length;
    if (count === 0) return [];
    return [
      {
        count,
        key,
        label: labels[key] ?? key,
        shareBasisPoints: total === 0 ? 0 : Math.round((count / total) * 10_000),
      },
    ];
  });
}

export function buildFlowBreakdown(
  leads: ReadonlyArray<DashboardLead>,
  limit = 5,
): DashboardBreakdown[] {
  const counts = new Map<string, number>();
  for (const lead of leads) counts.set(lead.flowTitle, (counts.get(lead.flowTitle) ?? 0) + 1);
  const total = leads.length;

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "pl-PL"))
    .slice(0, limit)
    .map(([label, count]) => ({
      count,
      key: label,
      label,
      shareBasisPoints: total === 0 ? 0 : Math.round((count / total) * 10_000),
    }));
}

export function buildEstimateBreakdown(leads: ReadonlyArray<DashboardLead>): DashboardBreakdown[] {
  const buckets = [
    { key: "below-10", label: "poniżej 10 000 zł", maximum: 1_000_000 },
    { key: "10-20", label: "10 000 – 20 000 zł", maximum: 2_000_000 },
    { key: "20-40", label: "20 000 – 40 000 zł", maximum: 4_000_000 },
    { key: "40-80", label: "40 000 – 80 000 zł", maximum: 8_000_000 },
    { key: "above-80", label: "powyżej 80 000 zł", maximum: Number.POSITIVE_INFINITY },
  ] as const;
  const pricedLeads = leads.filter(
    (lead) => lead.priceCurrency === "PLN" && lead.priceMinMinor !== null,
  );
  let previousMaximum = 0;

  return buckets.map((bucket) => {
    const count = pricedLeads.filter((lead) => {
      const value = lead.priceMinMinor ?? 0;
      return value >= previousMaximum && value < bucket.maximum;
    }).length;
    previousMaximum = bucket.maximum;
    return {
      count,
      key: bucket.key,
      label: bucket.label,
      shareBasisPoints:
        pricedLeads.length === 0 ? 0 : Math.round((count / pricedLeads.length) * 10_000),
    };
  });
}

export function isAttentionLead(
  lead: Pick<DashboardLead, "status" | "submittedAt">,
  now = Date.now(),
): boolean {
  if (lead.status === "new") return true;
  if (lead.status !== "in_progress") return false;
  return now - new Date(lead.submittedAt).getTime() >= 3 * 24 * 60 * 60 * 1_000;
}
