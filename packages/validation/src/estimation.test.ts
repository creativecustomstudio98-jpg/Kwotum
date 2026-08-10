import { describe, expect, it } from "vitest";

import { calculateEstimation, formatMinorAmount } from "./estimation";
import { estimationSchema, type Estimation } from "./flow";

const configuration: Estimation = {
  estimationSchemaVersion: 1,
  pricing: {
    baseMaxMinor: 150_00,
    baseMinMinor: 100_00,
    currency: "PLN",
    presentation: "range",
    roundingIncrementMinor: 100,
    rules: [
      {
        id: "premium_addition",
        label: "Wariant premium",
        operation: { maxMinor: 25_00, minMinor: 20_00, type: "add" },
        when: { operator: "equals", stepKey: "service", value: "premium" },
      },
      {
        id: "urgent_multiplier",
        label: "Pilny termin",
        operation: { basisPoints: 12_500, type: "multiply" },
        when: { operator: "equals", stepKey: "urgent", value: true },
      },
      {
        id: "meter_rate",
        label: "Dodatkowa powierzchnia",
        operation: {
          maxPerUnitMinor: 250,
          minPerUnitMinor: 150,
          quantityStepKey: "meters",
          type: "add_per_unit",
        },
        when: { operator: "answered", stepKey: "meters" },
      },
    ],
  },
  scoring: {
    categories: [
      { key: "cold", label: "Niski priorytet", minPoints: 0 },
      { key: "warm", label: "Dobry lead", minPoints: 40 },
      { key: "hot", label: "Wysoki priorytet", minPoints: 75 },
    ],
    initialPoints: 30,
    rules: [
      {
        id: "premium_score",
        label: "Wybrano wariant premium",
        points: 35,
        when: { operator: "equals", stepKey: "service", value: "premium" },
      },
      {
        id: "urgent_score",
        label: "Krótki termin",
        points: 50,
        when: { operator: "equals", stepKey: "urgent", value: true },
      },
    ],
  },
};

describe("deterministic estimation", () => {
  it("applies rules in document order and exposes an explanation", () => {
    const result = calculateEstimation(configuration, {
      meters: 2.5,
      service: "premium",
      urgent: true,
    });

    expect(result.pricing).toMatchObject({
      currency: "PLN",
      formattedMax: "225,00 zł",
      formattedMin: "154,00 zł",
      maxMinor: 22_500,
      minMinor: 15_400,
      presentation: "range",
    });
    expect(result.pricing.triggeredRules.map((rule) => rule.id)).toEqual([
      "premium_addition",
      "urgent_multiplier",
      "meter_rate",
    ]);
    expect(result.pricing.triggeredRules[1]).toMatchObject({
      maxMinorAfter: 21_875,
      minMinorAfter: 15_000,
    });
    expect(result.scoring).toEqual({
      category: { key: "hot", label: "Wysoki priorytet" },
      score: 100,
      triggeredRules: [
        { id: "premium_score", label: "Wybrano wariant premium", points: 35 },
        { id: "urgent_score", label: "Krótki termin", points: 50 },
      ],
    });
  });

  it("rounds half-up and supports currencies with different minor units", () => {
    const exact = structuredClone(configuration);
    exact.pricing.baseMinMinor = 105;
    exact.pricing.baseMaxMinor = 105;
    exact.pricing.presentation = "exact";
    exact.pricing.roundingIncrementMinor = 10;
    exact.pricing.rules = [];
    exact.pricing.currency = "JPY";

    expect(calculateEstimation(exact, {}).pricing.minMinor).toBe(110);
    expect(formatMinorAmount(1234, "JPY")).toBe("1234 JPY");
    expect(formatMinorAmount(1234, "EUR")).toBe("12,34 €");
  });

  it("rejects an exact configuration that can produce a range", () => {
    const invalid = structuredClone(configuration);
    invalid.pricing.baseMaxMinor = invalid.pricing.baseMinMinor;
    invalid.pricing.presentation = "exact";

    expect(estimationSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects unsafe quantity precision and arithmetic overflow", () => {
    expect(() =>
      calculateEstimation(configuration, {
        meters: 1.0001,
        service: "standard",
        urgent: false,
      }),
    ).toThrow(/trzy miejsca/);
    expect(() =>
      calculateEstimation(configuration, {
        meters: 1.001,
        service: "standard",
        urgent: false,
      }),
    ).not.toThrow();

    const unsafe = structuredClone(configuration);
    unsafe.pricing.baseMaxMinor = 9_000_000_000_000;
    unsafe.pricing.baseMinMinor = 9_000_000_000_000;
    unsafe.pricing.rules = [
      {
        id: "overflow_first",
        label: "Pierwsze mnożenie",
        operation: { basisPoints: 1_000_000, type: "multiply" },
        when: { operator: "answered", stepKey: "service" },
      },
      {
        id: "overflow_second",
        label: "Drugie mnożenie",
        operation: { basisPoints: 1_000_000, type: "multiply" },
        when: { operator: "answered", stepKey: "service" },
      },
    ];
    expect(() => calculateEstimation(unsafe, { service: "premium" })).toThrow(/bezpieczny zakres/);
  });
});
