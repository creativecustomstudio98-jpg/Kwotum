import type { Estimation, EstimationCondition } from "./flow";

export type EstimationAnswer = boolean | number | string | string[];
export type EstimationAnswers = Readonly<Record<string, EstimationAnswer>>;

export type TriggeredPricingRule = Readonly<{
  id: string;
  label: string;
  maxMinorAfter: number;
  minMinorAfter: number;
}>;

export type TriggeredScoringRule = Readonly<{
  id: string;
  label: string;
  points: number;
}>;

export type EstimationResult = Readonly<{
  pricing: Readonly<{
    currency: string;
    formattedMax: string;
    formattedMin: string;
    maxMinor: number;
    minMinor: number;
    presentation: "exact" | "from" | "range";
    triggeredRules: TriggeredPricingRule[];
  }>;
  scoring: Readonly<{
    category: Readonly<{ key: string; label: string }>;
    score: number;
    triggeredRules: TriggeredScoringRule[];
  }>;
}>;

const maxSafeInteger = BigInt(Number.MAX_SAFE_INTEGER);

export function conditionMatches(
  condition: EstimationCondition,
  answers: EstimationAnswers,
): boolean {
  const answer = answers[condition.stepKey];
  if (condition.operator === "answered") return answer !== undefined;
  if (condition.operator === "includes") {
    return Array.isArray(answer) && answer.includes(condition.value as string);
  }
  if (condition.operator === "equals") return answer === condition.value;
  return answer !== undefined && answer !== condition.value;
}

function divideHalfUp(value: bigint, divisor: bigint): bigint {
  return (value + divisor / 2n) / divisor;
}

function roundToIncrement(value: bigint, increment: bigint): bigint {
  return divideHalfUp(value, increment) * increment;
}

function safeNumber(value: bigint): number {
  if (value < 0n || value > maxSafeInteger) {
    throw new RangeError("Wynik estymacji przekracza bezpieczny zakres.");
  }
  return Number(value);
}

function quantityMilliUnits(answer: EstimationAnswer | undefined): bigint {
  if (typeof answer !== "number" || !Number.isFinite(answer) || answer < 0 || answer > 1_000_000) {
    throw new RangeError("Ilość dla stawki jednostkowej jest poza zakresem.");
  }
  const scaled = answer * 1000;
  const rounded = Math.round(scaled);
  if (Math.abs(scaled - rounded) > 1e-7) {
    throw new RangeError("Ilość może mieć maksymalnie trzy miejsca po przecinku.");
  }
  return BigInt(rounded);
}

export function formatMinorAmount(amountMinor: number, currency: string, locale = "pl-PL"): string {
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0) {
    throw new RangeError("Kwota musi być bezpieczną nieujemną liczbą całkowitą.");
  }
  const formatter = new Intl.NumberFormat(locale, {
    currency,
    currencyDisplay: "symbol",
    style: "currency",
  });
  const minorDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  return formatter.format(amountMinor / 10 ** minorDigits);
}

export function calculateEstimation(
  configuration: Estimation,
  answers: EstimationAnswers,
  locale = "pl-PL",
): EstimationResult {
  let minMinor = BigInt(configuration.pricing.baseMinMinor);
  let maxMinor = BigInt(configuration.pricing.baseMaxMinor);
  const triggeredPricingRules: TriggeredPricingRule[] = [];

  for (const rule of configuration.pricing.rules) {
    if (!conditionMatches(rule.when, answers)) continue;
    if (rule.operation.type === "add") {
      minMinor += BigInt(rule.operation.minMinor);
      maxMinor += BigInt(rule.operation.maxMinor);
    } else if (rule.operation.type === "multiply") {
      const basisPoints = BigInt(rule.operation.basisPoints);
      minMinor = divideHalfUp(minMinor * basisPoints, 10_000n);
      maxMinor = divideHalfUp(maxMinor * basisPoints, 10_000n);
    } else {
      const quantity = quantityMilliUnits(answers[rule.operation.quantityStepKey]);
      minMinor += divideHalfUp(BigInt(rule.operation.minPerUnitMinor) * quantity, 1000n);
      maxMinor += divideHalfUp(BigInt(rule.operation.maxPerUnitMinor) * quantity, 1000n);
    }
    triggeredPricingRules.push({
      id: rule.id,
      label: rule.label,
      maxMinorAfter: safeNumber(maxMinor),
      minMinorAfter: safeNumber(minMinor),
    });
  }

  const increment = BigInt(configuration.pricing.roundingIncrementMinor);
  minMinor = roundToIncrement(minMinor, increment);
  maxMinor = roundToIncrement(maxMinor, increment);
  const safeMin = safeNumber(minMinor);
  const safeMax = safeNumber(maxMinor);
  if (safeMin > safeMax) throw new RangeError("Minimalna cena przekracza maksymalną.");
  if (configuration.pricing.presentation === "exact" && safeMin !== safeMax) {
    throw new RangeError("Wynik exact nie może być przedziałem.");
  }

  let score = configuration.scoring.initialPoints;
  const triggeredScoringRules: TriggeredScoringRule[] = [];
  for (const rule of configuration.scoring.rules) {
    if (!conditionMatches(rule.when, answers)) continue;
    score = Math.min(100, Math.max(0, score + rule.points));
    triggeredScoringRules.push({ id: rule.id, label: rule.label, points: rule.points });
  }
  const category = configuration.scoring.categories
    .filter((candidate) => candidate.minPoints <= score)
    .at(-1);
  if (!category) throw new RangeError("Scoring nie ma kategorii dla wyniku.");

  return {
    pricing: {
      currency: configuration.pricing.currency,
      formattedMax: formatMinorAmount(safeMax, configuration.pricing.currency, locale),
      formattedMin: formatMinorAmount(safeMin, configuration.pricing.currency, locale),
      maxMinor: safeMax,
      minMinor: safeMin,
      presentation: configuration.pricing.presentation,
      triggeredRules: triggeredPricingRules,
    },
    scoring: {
      category: { key: category.key, label: category.label },
      score,
      triggeredRules: triggeredScoringRules,
    },
  };
}
