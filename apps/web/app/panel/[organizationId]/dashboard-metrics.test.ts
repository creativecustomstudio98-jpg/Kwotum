import { describe, expect, it } from "vitest";

import {
  buildDashboardDailySeries,
  buildEstimateBreakdown,
  buildFlowBreakdown,
  buildStatusBreakdown,
  isAttentionLead,
  leadsInPeriod,
  relativeTrend,
} from "./dashboard-metrics";

describe("dashboard metric comparisons", () => {
  it("calculates real relative changes with Polish formatting", () => {
    expect(relativeTrend(49, 39)).toEqual({ favorable: true, label: "+25,6%" });
    expect(relativeTrend(10_000, 9_750)).toEqual({ favorable: true, label: "+2,6%" });
    expect(relativeTrend(3_112_245, 2_930_000)).toEqual({
      favorable: true,
      label: "+6,2%",
    });
  });

  it("treats a shorter completion time as favorable", () => {
    expect(relativeTrend(192, 216, true)).toEqual({ favorable: true, label: "-11,1%" });
  });

  it("does not invent a percentage without a comparison base", () => {
    expect(relativeTrend(49, 0)).toBeNull();
    expect(relativeTrend(null, 39)).toBeNull();
  });

  it("uses an inclusive start and exclusive end for adjacent periods", () => {
    const leads = [
      { id: "before", submittedAt: "2026-05-31T23:59:59.999Z" },
      { id: "start", submittedAt: "2026-06-01T00:00:00.000Z" },
      { id: "inside", submittedAt: "2026-06-15T12:00:00.000Z" },
      { id: "end", submittedAt: "2026-07-01T00:00:00.000Z" },
    ];

    expect(
      leadsInPeriod(leads, {
        from: "2026-06-01T00:00:00.000Z",
        to: "2026-07-01T00:00:00.000Z",
      }).map((lead) => lead.id),
    ).toEqual(["start", "inside"]);
  });

  it("builds a real daily series with quality and PLN estimate totals", () => {
    const leads = [
      {
        flowTitle: "Kuchnia",
        priceCurrency: "PLN",
        priceMaxMinor: 2_000_000,
        priceMinMinor: 1_000_000,
        score: 84,
        status: "new",
        submittedAt: "2026-07-28T09:00:00.000Z",
      },
      {
        flowTitle: "Ogród",
        priceCurrency: "EUR",
        priceMaxMinor: 4_000,
        priceMinMinor: 3_000,
        score: 70,
        status: "in_progress",
        submittedAt: "2026-07-28T12:00:00.000Z",
      },
      {
        flowTitle: "Kuchnia",
        priceCurrency: "PLN",
        priceMaxMinor: 3_000_000,
        priceMinMinor: 2_000_000,
        score: 92,
        status: "won",
        submittedAt: "2026-07-29T08:00:00.000Z",
      },
    ];

    expect(
      buildDashboardDailySeries(
        leads,
        {
          from: "2026-07-27T12:00:00.000Z",
          to: "2026-07-30T12:00:00.000Z",
        },
        3,
      ).map(({ estimateMinor, leads: count, qualityLeads }) => ({
        count,
        estimateMinor,
        qualityLeads,
      })),
    ).toEqual([
      { count: 0, estimateMinor: 0, qualityLeads: 0 },
      { count: 2, estimateMinor: 1_000_000, qualityLeads: 1 },
      { count: 1, estimateMinor: 2_000_000, qualityLeads: 1 },
    ]);
  });

  it("creates truthful status, process and estimate breakdowns", () => {
    const leads = [
      {
        flowTitle: "Kuchnia",
        priceCurrency: "PLN",
        priceMaxMinor: 1_500_000,
        priceMinMinor: 900_000,
        score: 84,
        status: "new",
        submittedAt: "2026-07-28T09:00:00.000Z",
      },
      {
        flowTitle: "Kuchnia",
        priceCurrency: "PLN",
        priceMaxMinor: 3_000_000,
        priceMinMinor: 2_500_000,
        score: 70,
        status: "in_progress",
        submittedAt: "2026-07-27T09:00:00.000Z",
      },
      {
        flowTitle: "Ogród",
        priceCurrency: "EUR",
        priceMaxMinor: 10_000,
        priceMinMinor: 8_000,
        score: 92,
        status: "new",
        submittedAt: "2026-07-26T09:00:00.000Z",
      },
    ];

    expect(buildStatusBreakdown(leads)).toMatchObject([
      { count: 2, key: "new" },
      { count: 1, key: "in_progress" },
    ]);
    expect(buildFlowBreakdown(leads)).toMatchObject([
      { count: 2, label: "Kuchnia" },
      { count: 1, label: "Ogród" },
    ]);
    expect(buildEstimateBreakdown(leads).map((bucket) => bucket.count)).toEqual([1, 0, 1, 0, 0]);
  });

  it("flags only new leads and stale in-progress work for attention", () => {
    const now = new Date("2026-07-29T12:00:00.000Z").getTime();
    expect(isAttentionLead({ status: "new", submittedAt: "2026-07-29T11:00:00.000Z" }, now)).toBe(
      true,
    );
    expect(
      isAttentionLead({ status: "in_progress", submittedAt: "2026-07-25T11:00:00.000Z" }, now),
    ).toBe(true);
    expect(
      isAttentionLead({ status: "in_progress", submittedAt: "2026-07-28T11:00:00.000Z" }, now),
    ).toBe(false);
    expect(isAttentionLead({ status: "won", submittedAt: "2026-07-20T11:00:00.000Z" }, now)).toBe(
      false,
    );
  });
});
