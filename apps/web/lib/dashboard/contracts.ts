import { z } from "zod";

const safeNonnegativeInteger = z.number().int().nonnegative().safe();
const shareBasisPoints = z.number().int().min(0).max(10_000);

const periodSchema = z
  .object({
    from: z.iso.datetime({ offset: true }),
    to: z.iso.datetime({ offset: true }),
  })
  .strict();

const totalsSchema = z
  .object({
    estimateMinor: safeNonnegativeInteger,
    leads: safeNonnegativeInteger,
    pricedLeads: safeNonnegativeInteger,
    qualityLeads: safeNonnegativeInteger,
  })
  .strict()
  .superRefine((totals, context) => {
    if (totals.pricedLeads > totals.leads) {
      context.addIssue({ code: "custom", message: "Priced leads exceed all leads." });
    }
    if (totals.qualityLeads > totals.leads) {
      context.addIssue({ code: "custom", message: "Quality leads exceed all leads." });
    }
    if (totals.pricedLeads === 0 && totals.estimateMinor !== 0) {
      context.addIssue({ code: "custom", message: "Estimate exists without priced leads." });
    }
  });

const dailyPointSchema = z
  .object({
    date: z.iso.date(),
    estimateMinor: safeNonnegativeInteger,
    leads: safeNonnegativeInteger,
    qualityLeads: safeNonnegativeInteger,
  })
  .strict()
  .superRefine((point, context) => {
    if (point.qualityLeads > point.leads) {
      context.addIssue({ code: "custom", message: "Daily quality leads exceed all leads." });
    }
  });

const statusBreakdownSchema = z
  .object({
    count: safeNonnegativeInteger.positive(),
    key: z.enum(["new", "in_progress", "qualified", "won", "lost", "spam"]),
    shareBasisPoints,
  })
  .strict();

const flowBreakdownSchema = z
  .object({
    count: safeNonnegativeInteger.positive(),
    key: z.uuid(),
    label: z.string().min(2).max(160),
    shareBasisPoints,
  })
  .strict();

const estimateBreakdownSchema = z
  .object({
    count: safeNonnegativeInteger,
    key: z.enum(["below-10", "10-20", "20-40", "40-80", "above-80"]),
    shareBasisPoints,
  })
  .strict();

export const operationalLeadOverviewSchema = z
  .object({
    daily: z.array(dailyPointSchema).min(1).max(91),
    estimateBuckets: z.array(estimateBreakdownSchema).max(5),
    flows: z.array(flowBreakdownSchema).max(5),
    period: periodSchema,
    previousPeriod: periodSchema,
    previousTotals: totalsSchema,
    statuses: z.array(statusBreakdownSchema).max(6),
    totals: totalsSchema,
  })
  .strict()
  .superRefine((overview, context) => {
    const periodFrom = new Date(overview.period.from).getTime();
    const periodTo = new Date(overview.period.to).getTime();
    const previousFrom = new Date(overview.previousPeriod.from).getTime();
    const previousTo = new Date(overview.previousPeriod.to).getTime();

    if (
      periodTo <= periodFrom ||
      previousTo !== periodFrom ||
      previousTo - previousFrom !== periodTo - periodFrom
    ) {
      context.addIssue({ code: "custom", message: "Operational lead periods are not adjacent." });
    }

    const dailyLeads = overview.daily.reduce((total, point) => total + point.leads, 0);
    const dailyQualityLeads = overview.daily.reduce(
      (total, point) => total + point.qualityLeads,
      0,
    );
    const dailyEstimateMinor = overview.daily.reduce(
      (total, point) => total + point.estimateMinor,
      0,
    );
    if (
      dailyLeads !== overview.totals.leads ||
      dailyQualityLeads !== overview.totals.qualityLeads ||
      dailyEstimateMinor !== overview.totals.estimateMinor
    ) {
      context.addIssue({ code: "custom", message: "Daily totals disagree with the overview." });
    }

    const dates = overview.daily.map((point) => point.date);
    if (
      new Set(dates).size !== dates.length ||
      dates.some((date, index) => index > 0 && date <= dates[index - 1]!)
    ) {
      context.addIssue({ code: "custom", message: "Daily dates are not unique and ordered." });
    }

    const statusCount = overview.statuses.reduce((total, item) => total + item.count, 0);
    if (statusCount !== overview.totals.leads) {
      context.addIssue({ code: "custom", message: "Status totals disagree with all leads." });
    }

    const flowCount = overview.flows.reduce((total, item) => total + item.count, 0);
    if (flowCount > overview.totals.leads) {
      context.addIssue({ code: "custom", message: "Flow totals exceed all leads." });
    }

    const estimateCount = overview.estimateBuckets.reduce((total, item) => total + item.count, 0);
    if (
      estimateCount !== overview.totals.pricedLeads ||
      (overview.totals.pricedLeads === 0 && overview.estimateBuckets.length !== 0) ||
      (overview.totals.pricedLeads > 0 && overview.estimateBuckets.length !== 5)
    ) {
      context.addIssue({ code: "custom", message: "Estimate buckets disagree with priced leads." });
    }

    for (const [name, values] of [
      ["statuses", overview.statuses],
      ["flows", overview.flows],
      ["estimateBuckets", overview.estimateBuckets],
    ] as const) {
      const keys = values.map((item) => item.key);
      if (new Set(keys).size !== keys.length) {
        context.addIssue({ code: "custom", message: `Duplicate ${name} keys.` });
      }
    }
  });

export type OperationalLeadOverview = z.infer<typeof operationalLeadOverviewSchema>;
