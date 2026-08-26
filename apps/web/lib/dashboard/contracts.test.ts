import { describe, expect, it } from "vitest";

import { operationalLeadOverviewSchema } from "./contracts";

const overview = {
  daily: [
    { date: "2026-01-01", estimateMinor: 500_000, leads: 1, qualityLeads: 1 },
    { date: "2026-01-02", estimateMinor: 1_500_000, leads: 2, qualityLeads: 0 },
  ],
  estimateBuckets: [
    { count: 1, key: "below-10", shareBasisPoints: 5_000 },
    { count: 1, key: "10-20", shareBasisPoints: 5_000 },
    { count: 0, key: "20-40", shareBasisPoints: 0 },
    { count: 0, key: "40-80", shareBasisPoints: 0 },
    { count: 0, key: "above-80", shareBasisPoints: 0 },
  ],
  flows: [
    {
      count: 3,
      key: "f1000000-0000-4000-8000-000000000001",
      label: "Proces testowy",
      shareBasisPoints: 10_000,
    },
  ],
  period: { from: "2026-01-01T00:00:00.000Z", to: "2026-01-03T00:00:00.000Z" },
  previousPeriod: {
    from: "2025-12-30T00:00:00.000Z",
    to: "2026-01-01T00:00:00.000Z",
  },
  previousTotals: { estimateMinor: 750_000, leads: 1, pricedLeads: 1, qualityLeads: 0 },
  statuses: [
    { count: 2, key: "new", shareBasisPoints: 6_667 },
    { count: 1, key: "won", shareBasisPoints: 3_333 },
  ],
  totals: { estimateMinor: 2_000_000, leads: 3, pricedLeads: 2, qualityLeads: 1 },
} as const;

describe("operational lead overview contract", () => {
  it("accepts a complete, internally consistent aggregate", () => {
    expect(operationalLeadOverviewSchema.parse(overview)).toEqual(overview);
  });

  it("rejects truncated daily data and arbitrary fields", () => {
    expect(
      operationalLeadOverviewSchema.safeParse({
        ...overview,
        daily: overview.daily.slice(0, 1),
      }).success,
    ).toBe(false);
    expect(
      operationalLeadOverviewSchema.safeParse({
        ...overview,
        contactEmail: "person@example.test",
      }).success,
    ).toBe(false);
  });

  it("rejects overlapping comparison periods and duplicate breakdown keys", () => {
    expect(
      operationalLeadOverviewSchema.safeParse({
        ...overview,
        previousPeriod: {
          from: "2025-12-31T00:00:00.000Z",
          to: "2026-01-02T00:00:00.000Z",
        },
      }).success,
    ).toBe(false);
    expect(
      operationalLeadOverviewSchema.safeParse({
        ...overview,
        statuses: [overview.statuses[0], overview.statuses[0], overview.statuses[1]],
      }).success,
    ).toBe(false);
  });
});
