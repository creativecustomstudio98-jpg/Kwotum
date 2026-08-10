import { z } from "zod";

const keySchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z][a-z0-9_]*$/);

const optionalTextSchema = z.string().trim().min(1).max(500).optional();
const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);

const httpsUrlSchema = z
  .url()
  .max(500)
  .refine((value) => new URL(value).protocol === "https:", {
    message: "Adres polityki prywatności musi używać HTTPS.",
  });

const consentContentSchema = z
  .object({
    label: z.string().trim().min(10).max(500),
    textHash: sha256Schema,
    version: z.string().trim().min(1).max(80),
  })
  .strict();

export const leadCaptureSchema = z
  .object({
    filesEnabled: z.boolean(),
    leadCaptureSchemaVersion: z.literal(1),
    marketingEmailConsent: consentContentSchema.optional(),
    privacyNotice: consentContentSchema
      .extend({
        policyUrl: httpsUrlSchema.optional(),
      })
      .strict(),
  })
  .strict();

export const flowDraftMetadataSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    slug: z
      .string()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  })
  .strict();

export const flowOptionSchema = z
  .object({
    key: keySchema,
    label: z.string().trim().min(1).max(160),
    nextStepKey: keySchema.nullable().optional(),
  })
  .strict();

export const estimationConditionSchema = z
  .object({
    operator: z.enum(["answered", "equals", "includes", "not_equals"]),
    stepKey: keySchema,
    value: z.union([z.boolean(), z.number().finite(), z.string().max(500)]).optional(),
  })
  .strict();

export const flowStepV1Schema = z
  .object({
    allowUnknown: z.boolean().default(false),
    description: optionalTextSchema,
    key: keySchema,
    nextStepKey: keySchema.nullable(),
    options: z.array(flowOptionSchema).max(20).default([]),
    required: z.boolean().default(true),
    title: z.string().trim().min(1).max(240),
    type: z.enum([
      "budget",
      "date",
      "location",
      "long_text",
      "multiple_choice",
      "number",
      "short_text",
      "single_choice",
      "yes_no",
    ]),
  })
  .strict();

const textLengthValidationSchema = z
  .object({
    kind: z.literal("text_length"),
    maxLength: z.number().int().min(1).max(2000),
    minLength: z.number().int().min(0).max(2000),
  })
  .strict()
  .refine((value) => value.minLength <= value.maxLength, {
    message: "Minimalna długość nie może przekraczać maksymalnej.",
    path: ["minLength"],
  });

const numberRangeValidationSchema = z
  .object({
    kind: z.literal("number_range"),
    max: z.number().finite().optional(),
    min: z.number().finite().optional(),
  })
  .strict()
  .refine((value) => value.min !== undefined || value.max !== undefined, {
    message: "Zakres liczbowy wymaga co najmniej jednej granicy.",
  })
  .refine((value) => value.min === undefined || value.max === undefined || value.min <= value.max, {
    message: "Minimalna wartość nie może przekraczać maksymalnej.",
    path: ["min"],
  });

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
  }, "Data musi być poprawną datą w formacie RRRR-MM-DD.");

const dateRangeValidationSchema = z
  .object({
    kind: z.literal("date_range"),
    max: isoDateSchema.optional(),
    min: isoDateSchema.optional(),
  })
  .strict()
  .refine((value) => value.min !== undefined || value.max !== undefined, {
    message: "Zakres dat wymaga co najmniej jednej granicy.",
  })
  .refine((value) => value.min === undefined || value.max === undefined || value.min <= value.max, {
    message: "Data początkowa nie może być późniejsza od końcowej.",
    path: ["min"],
  });

export const flowStepValidationSchema = z.discriminatedUnion("kind", [
  textLengthValidationSchema,
  numberRangeValidationSchema,
  dateRangeValidationSchema,
]);

export const flowStepSchema = flowStepV1Schema
  .extend({
    sectionKey: keySchema,
    validation: flowStepValidationSchema.optional(),
  })
  .strict();

export const flowSectionSchema = z
  .object({
    key: keySchema,
    title: z.string().trim().min(1).max(120),
  })
  .strict();

export const flowRuleSchema = z
  .object({
    id: keySchema,
    then: z
      .object({
        action: z.literal("go_to"),
        stepKey: keySchema.nullable(),
      })
      .strict(),
    when: estimationConditionSchema,
  })
  .strict();

const amountSchema = z.number().int().min(0).max(9_000_000_000_000);

export const pricingRuleSchema = z
  .object({
    id: keySchema,
    label: z.string().trim().min(1).max(160),
    operation: z.discriminatedUnion("type", [
      z
        .object({
          maxMinor: amountSchema,
          minMinor: amountSchema,
          type: z.literal("add"),
        })
        .strict(),
      z
        .object({
          basisPoints: z.number().int().min(1).max(1_000_000),
          type: z.literal("multiply"),
        })
        .strict(),
      z
        .object({
          maxPerUnitMinor: amountSchema,
          minPerUnitMinor: amountSchema,
          quantityStepKey: keySchema,
          type: z.literal("add_per_unit"),
        })
        .strict(),
    ]),
    when: estimationConditionSchema,
  })
  .strict()
  .superRefine((rule, context) => {
    if (rule.operation.type === "add" && rule.operation.minMinor > rule.operation.maxMinor) {
      context.addIssue({
        code: "custom",
        message: "Minimalna zmiana ceny nie może przekraczać maksymalnej.",
        path: ["operation", "minMinor"],
      });
    }
    if (
      rule.operation.type === "add_per_unit" &&
      rule.operation.minPerUnitMinor > rule.operation.maxPerUnitMinor
    ) {
      context.addIssue({
        code: "custom",
        message: "Minimalna stawka jednostkowa nie może przekraczać maksymalnej.",
        path: ["operation", "minPerUnitMinor"],
      });
    }
  });

export const scoringRuleSchema = z
  .object({
    id: keySchema,
    label: z.string().trim().min(1).max(160),
    points: z.number().int().min(-100).max(100),
    when: estimationConditionSchema,
  })
  .strict();

export const estimationSchema = z
  .object({
    estimationSchemaVersion: z.literal(1),
    pricing: z
      .object({
        baseMaxMinor: amountSchema,
        baseMinMinor: amountSchema,
        currency: z.enum([
          "BHD",
          "CHF",
          "CZK",
          "DKK",
          "EUR",
          "GBP",
          "JPY",
          "NOK",
          "PLN",
          "SEK",
          "USD",
        ]),
        presentation: z.enum(["exact", "from", "range"]),
        roundingIncrementMinor: z.number().int().min(1).max(1_000_000),
        rules: z.array(pricingRuleSchema).max(50),
      })
      .strict(),
    scoring: z
      .object({
        categories: z
          .array(
            z
              .object({
                key: keySchema,
                label: z.string().trim().min(1).max(120),
                minPoints: z.number().int().min(0).max(100),
              })
              .strict(),
          )
          .min(1)
          .max(10),
        initialPoints: z.number().int().min(0).max(100),
        rules: z.array(scoringRuleSchema).max(50),
      })
      .strict(),
  })
  .strict()
  .superRefine((estimation, context) => {
    if (estimation.pricing.baseMinMinor > estimation.pricing.baseMaxMinor) {
      context.addIssue({
        code: "custom",
        message: "Minimalna cena bazowa nie może przekraczać maksymalnej.",
        path: ["pricing", "baseMinMinor"],
      });
    }
    if (
      estimation.pricing.presentation === "exact" &&
      estimation.pricing.baseMinMinor !== estimation.pricing.baseMaxMinor
    ) {
      context.addIssue({
        code: "custom",
        message: "Tryb exact wymaga równej bazowej ceny minimalnej i maksymalnej.",
        path: ["pricing", "presentation"],
      });
    }
    if (
      estimation.pricing.presentation === "exact" &&
      estimation.pricing.rules.some(
        (rule) =>
          (rule.operation.type === "add" && rule.operation.minMinor !== rule.operation.maxMinor) ||
          (rule.operation.type === "add_per_unit" &&
            rule.operation.minPerUnitMinor !== rule.operation.maxPerUnitMinor),
      )
    ) {
      context.addIssue({
        code: "custom",
        message: "Tryb exact nie może zawierać reguły tworzącej przedział.",
        path: ["pricing", "rules"],
      });
    }
    const categoryKeys = estimation.scoring.categories.map((category) => category.key);
    if (new Set(categoryKeys).size !== categoryKeys.length) {
      context.addIssue({
        code: "custom",
        message: "Klucze kategorii scoringu muszą być unikalne.",
        path: ["scoring", "categories"],
      });
    }
    if (estimation.scoring.categories[0]?.minPoints !== 0) {
      context.addIssue({
        code: "custom",
        message: "Pierwsza kategoria scoringu musi zaczynać się od 0 punktów.",
        path: ["scoring", "categories", 0, "minPoints"],
      });
    }
    for (let index = 1; index < estimation.scoring.categories.length; index += 1) {
      const previous = estimation.scoring.categories[index - 1];
      const current = estimation.scoring.categories[index];
      if (previous && current && current.minPoints <= previous.minPoints) {
        context.addIssue({
          code: "custom",
          message: "Progi kategorii scoringu muszą być ściśle rosnące.",
          path: ["scoring", "categories", index, "minPoints"],
        });
      }
    }
  });

const flowResultSchema = z
  .object({
    disclaimer: z.string().trim().min(1).max(800),
    headline: z.string().trim().min(1).max(240),
    mode: z.enum(["consultation", "no_price"]),
    nextStepLabel: z.string().trim().min(1).max(120),
  })
  .strict();

const flowDocumentBaseShape = {
  entryStepKey: keySchema,
  estimation: estimationSchema.optional(),
  intro: z.string().trim().min(1).max(800),
  leadCapture: leadCaptureSchema.optional(),
  result: flowResultSchema,
  rules: z.array(flowRuleSchema).max(50).default([]),
  title: z.string().trim().min(2).max(160),
};

export const flowDocumentV1Schema = z
  .object({
    ...flowDocumentBaseShape,
    schemaVersion: z.literal(1),
    steps: z.array(flowStepV1Schema).min(1).max(40),
  })
  .strict();

export const flowDocumentSchema = z
  .object({
    ...flowDocumentBaseShape,
    schemaVersion: z.literal(2),
    sections: z.array(flowSectionSchema).min(1).max(20),
    steps: z.array(flowStepSchema).min(1).max(40),
  })
  .strict();

export const storedFlowDocumentSchema = z.discriminatedUnion("schemaVersion", [
  flowDocumentV1Schema,
  flowDocumentSchema,
]);

export type FlowDocumentV1 = z.infer<typeof flowDocumentV1Schema>;
export type FlowDocument = z.infer<typeof flowDocumentSchema>;
export type StoredFlowDocument = z.infer<typeof storedFlowDocumentSchema>;
export type Estimation = z.infer<typeof estimationSchema>;
export type EstimationCondition = z.infer<typeof estimationConditionSchema>;
export type LeadCapture = z.infer<typeof leadCaptureSchema>;
export type FlowDraftMetadata = z.infer<typeof flowDraftMetadataSchema>;
export type FlowOption = z.infer<typeof flowOptionSchema>;
export type FlowRule = z.infer<typeof flowRuleSchema>;
export type FlowStep = z.infer<typeof flowStepSchema>;
export type FlowStepV1 = z.infer<typeof flowStepV1Schema>;
export type FlowStepValidation = z.infer<typeof flowStepValidationSchema>;
export type FlowSection = z.infer<typeof flowSectionSchema>;

export type FlowValidationIssueCode =
  | "CONDITION_OPTION_NOT_FOUND"
  | "CONDITION_STEP_NOT_FOUND"
  | "CONDITION_VALUE_REQUIRED"
  | "DUPLICATE_SECTION_KEY"
  | "DUPLICATE_OPTION_KEY"
  | "DUPLICATE_ESTIMATION_RULE_ID"
  | "DUPLICATE_RULE_ID"
  | "DUPLICATE_STEP_KEY"
  | "EMPTY_SECTION"
  | "ENTRY_STEP_NOT_FOUND"
  | "FLOW_CYCLE"
  | "INVALID_OPTIONS"
  | "INVALID_QUANTITY_STEP"
  | "INVALID_SECTION"
  | "INVALID_STEP_VALIDATION"
  | "NO_TERMINAL_PATH"
  | "SECTION_NOT_FOUND"
  | "SECTION_ORDER_INVALID"
  | "TARGET_STEP_NOT_FOUND"
  | "UNREACHABLE_STEP";

export type FlowValidationIssue = Readonly<{
  code: FlowValidationIssueCode;
  message: string;
  path: string;
  severity: "error";
}>;

export type FlowValidationResult = Readonly<{
  issues: FlowValidationIssue[];
  valid: boolean;
}>;

function issue(code: FlowValidationIssueCode, path: string, message: string): FlowValidationIssue {
  return { code, message, path, severity: "error" };
}

const legacySectionBlueprints = [
  { key: "informacje_podstawowe", title: "Informacje podstawowe" },
  { key: "potrzeby_i_cele", title: "Potrzeby i cele" },
  { key: "budzet_i_realizacja", title: "Budżet i realizacja" },
  { key: "dodatkowe_informacje", title: "Dodatkowe informacje" },
] as const;

export function upgradeFlowDocument(document: StoredFlowDocument): FlowDocument {
  if (document.schemaVersion === 2) {
    return flowDocumentSchema.parse(document);
  }

  const sectionSize = Math.max(
    1,
    Math.ceil(document.steps.length / legacySectionBlueprints.length),
  );
  const sectionCount = Math.ceil(document.steps.length / sectionSize);
  const sections = legacySectionBlueprints.slice(0, sectionCount);
  const steps = document.steps.map((step, index) => ({
    ...step,
    sectionKey:
      sections[Math.min(sections.length - 1, Math.floor(index / sectionSize))]?.key ??
      legacySectionBlueprints[0].key,
  }));

  return flowDocumentSchema.parse({
    ...document,
    schemaVersion: 2,
    sections,
    steps,
  });
}

export function parseFlowDocument(input: unknown): FlowDocument {
  return upgradeFlowDocument(storedFlowDocumentSchema.parse(input));
}

function findDuplicates(values: string[]): Set<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return duplicates;
}

function addEdge(
  adjacency: Map<string, Set<string>>,
  existingStepKeys: Set<string>,
  issues: FlowValidationIssue[],
  source: string,
  target: string | null | undefined,
  path: string,
): void {
  if (target === null || target === undefined) return;
  if (!existingStepKeys.has(target)) {
    issues.push(
      issue("TARGET_STEP_NOT_FOUND", path, `Cel „${target}” nie istnieje w tym procesie.`),
    );
    return;
  }
  adjacency.get(source)?.add(target);
}

function hasCycle(
  adjacency: ReadonlyMap<string, ReadonlySet<string>>,
  entryStepKey: string,
): boolean {
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (stepKey: string): boolean => {
    if (visiting.has(stepKey)) return true;
    if (visited.has(stepKey)) return false;
    visiting.add(stepKey);
    for (const target of adjacency.get(stepKey) ?? []) {
      if (visit(target)) return true;
    }
    visiting.delete(stepKey);
    visited.add(stepKey);
    return false;
  };

  return visit(entryStepKey);
}

function stepValidationIsCompatible(step: FlowStep): boolean {
  if (!step.validation) return true;
  if (step.validation.kind === "text_length") {
    const typeLimit = step.type === "long_text" ? 2000 : 500;
    return (
      (step.type === "long_text" || step.type === "location" || step.type === "short_text") &&
      step.validation.maxLength <= typeLimit
    );
  }
  if (step.validation.kind === "number_range") {
    return step.type === "budget" || step.type === "number";
  }
  return step.type === "date";
}

export function validateFlowDocument(document: FlowDocument): FlowValidationResult {
  const issues: FlowValidationIssue[] = [];
  const sectionKeys = document.sections.map((section) => section.key);
  const sectionIndexByKey = new Map(sectionKeys.map((key, index) => [key, index]));
  const sectionUsage = new Map(sectionKeys.map((key) => [key, 0]));
  const stepKeys = document.steps.map((step) => step.key);
  const existingStepKeys = new Set(stepKeys);
  const stepByKey = new Map(document.steps.map((step) => [step.key, step]));
  const adjacency = new Map(document.steps.map((step) => [step.key, new Set<string>()]));

  for (const duplicate of findDuplicates(sectionKeys)) {
    issues.push(
      issue(
        "DUPLICATE_SECTION_KEY",
        "sections",
        `Klucz sekcji „${duplicate}” występuje więcej niż raz.`,
      ),
    );
  }

  let highestSectionIndex = -1;
  document.steps.forEach((step, stepIndex) => {
    const sectionIndex = sectionIndexByKey.get(step.sectionKey);
    if (sectionIndex === undefined) {
      issues.push(
        issue(
          "SECTION_NOT_FOUND",
          `steps.${stepIndex}.sectionKey`,
          `Sekcja „${step.sectionKey}” nie istnieje w tym procesie.`,
        ),
      );
    } else {
      sectionUsage.set(step.sectionKey, (sectionUsage.get(step.sectionKey) ?? 0) + 1);
      if (sectionIndex < highestSectionIndex) {
        issues.push(
          issue(
            "SECTION_ORDER_INVALID",
            `steps.${stepIndex}.sectionKey`,
            "Pytania należące do jednej sekcji muszą tworzyć spójną, uporządkowaną grupę.",
          ),
        );
      }
      highestSectionIndex = Math.max(highestSectionIndex, sectionIndex);
    }

    if (!stepValidationIsCompatible(step)) {
      issues.push(
        issue(
          "INVALID_STEP_VALIDATION",
          `steps.${stepIndex}.validation`,
          `Walidacja kroku „${step.title}” nie pasuje do jego typu.`,
        ),
      );
    }
  });

  document.sections.forEach((section, sectionIndex) => {
    if ((sectionUsage.get(section.key) ?? 0) === 0) {
      issues.push(
        issue(
          "EMPTY_SECTION",
          `sections.${sectionIndex}`,
          `Sekcja „${section.title}” nie zawiera żadnego pytania.`,
        ),
      );
    }
  });

  for (const duplicate of findDuplicates(stepKeys)) {
    issues.push(
      issue("DUPLICATE_STEP_KEY", "steps", `Klucz kroku „${duplicate}” występuje więcej niż raz.`),
    );
  }

  for (const duplicate of findDuplicates(document.rules.map((rule) => rule.id))) {
    issues.push(
      issue(
        "DUPLICATE_RULE_ID",
        "rules",
        `Identyfikator reguły „${duplicate}” występuje więcej niż raz.`,
      ),
    );
  }

  const estimationRules = [
    ...(document.estimation?.pricing.rules ?? []),
    ...(document.estimation?.scoring.rules ?? []),
  ];
  for (const duplicate of findDuplicates(estimationRules.map((rule) => rule.id))) {
    issues.push(
      issue(
        "DUPLICATE_ESTIMATION_RULE_ID",
        "estimation",
        `Identyfikator reguły estymacji „${duplicate}” występuje więcej niż raz.`,
      ),
    );
  }

  if (!existingStepKeys.has(document.entryStepKey)) {
    issues.push(issue("ENTRY_STEP_NOT_FOUND", "entryStepKey", "Krok startowy nie istnieje."));
  }

  document.steps.forEach((step, stepIndex) => {
    const optionKeys = step.options.map((option) => option.key);
    for (const duplicate of findDuplicates(optionKeys)) {
      issues.push(
        issue(
          "DUPLICATE_OPTION_KEY",
          `steps.${stepIndex}.options`,
          `Klucz opcji „${duplicate}” występuje więcej niż raz.`,
        ),
      );
    }

    const choiceStep = step.type === "single_choice" || step.type === "multiple_choice";
    if ((choiceStep && step.options.length < 2) || (!choiceStep && step.options.length > 0)) {
      issues.push(
        issue(
          "INVALID_OPTIONS",
          `steps.${stepIndex}.options`,
          choiceStep
            ? "Krok wyboru wymaga co najmniej dwóch opcji."
            : "Ten typ kroku nie przyjmuje opcji.",
        ),
      );
    }
    if (
      step.type === "multiple_choice" &&
      step.options.some((option) => option.nextStepKey !== undefined)
    ) {
      issues.push(
        issue(
          "INVALID_OPTIONS",
          `steps.${stepIndex}.options`,
          "Opcje wielokrotnego wyboru nie mogą zmieniać trasy bez reguły.",
        ),
      );
    }

    addEdge(
      adjacency,
      existingStepKeys,
      issues,
      step.key,
      step.nextStepKey,
      `steps.${stepIndex}.nextStepKey`,
    );
    step.options.forEach((option, optionIndex) => {
      addEdge(
        adjacency,
        existingStepKeys,
        issues,
        step.key,
        option.nextStepKey,
        `steps.${stepIndex}.options.${optionIndex}.nextStepKey`,
      );
    });
  });

  document.rules.forEach((rule, ruleIndex) => {
    const conditionStep = stepByKey.get(rule.when.stepKey);
    if (!conditionStep) {
      issues.push(
        issue(
          "CONDITION_STEP_NOT_FOUND",
          `rules.${ruleIndex}.when.stepKey`,
          `Reguła odwołuje się do nieistniejącego kroku „${rule.when.stepKey}”.`,
        ),
      );
    } else if (
      rule.when.value !== undefined &&
      (rule.when.operator === "equals" ||
        rule.when.operator === "not_equals" ||
        rule.when.operator === "includes") &&
      conditionStep.options.length > 0 &&
      typeof rule.when.value === "string" &&
      !conditionStep.options.some((option) => option.key === rule.when.value)
    ) {
      issues.push(
        issue(
          "CONDITION_OPTION_NOT_FOUND",
          `rules.${ruleIndex}.when.value`,
          `Reguła odwołuje się do nieistniejącej opcji „${rule.when.value}”.`,
        ),
      );
    }

    if (rule.when.operator !== "answered" && rule.when.value === undefined) {
      issues.push(
        issue(
          "CONDITION_VALUE_REQUIRED",
          `rules.${ruleIndex}.when.value`,
          "Operator warunku wymaga wartości.",
        ),
      );
    }

    addEdge(
      adjacency,
      existingStepKeys,
      issues,
      rule.when.stepKey,
      rule.then.stepKey,
      `rules.${ruleIndex}.then.stepKey`,
    );
  });

  estimationRules.forEach((rule, ruleIndex) => {
    const conditionStep = stepByKey.get(rule.when.stepKey);
    if (!conditionStep) {
      issues.push(
        issue(
          "CONDITION_STEP_NOT_FOUND",
          `estimation.rules.${ruleIndex}.when.stepKey`,
          `Reguła estymacji odwołuje się do nieistniejącego kroku „${rule.when.stepKey}”.`,
        ),
      );
    } else if (
      rule.when.value !== undefined &&
      (rule.when.operator === "equals" ||
        rule.when.operator === "not_equals" ||
        rule.when.operator === "includes") &&
      conditionStep.options.length > 0 &&
      typeof rule.when.value === "string" &&
      !conditionStep.options.some((option) => option.key === rule.when.value)
    ) {
      issues.push(
        issue(
          "CONDITION_OPTION_NOT_FOUND",
          `estimation.rules.${ruleIndex}.when.value`,
          `Reguła estymacji odwołuje się do nieistniejącej opcji „${rule.when.value}”.`,
        ),
      );
    }
    if (rule.when.operator !== "answered" && rule.when.value === undefined) {
      issues.push(
        issue(
          "CONDITION_VALUE_REQUIRED",
          `estimation.rules.${ruleIndex}.when.value`,
          "Operator warunku estymacji wymaga wartości.",
        ),
      );
    }
    if ("operation" in rule && rule.operation.type === "add_per_unit") {
      const quantityStep = stepByKey.get(rule.operation.quantityStepKey);
      if (!quantityStep || quantityStep.type !== "number") {
        issues.push(
          issue(
            "INVALID_QUANTITY_STEP",
            `estimation.rules.${ruleIndex}.operation.quantityStepKey`,
            "Stawka jednostkowa wymaga istniejącego kroku typu number.",
          ),
        );
      }
    }
  });

  if (existingStepKeys.has(document.entryStepKey)) {
    const reachable = new Set<string>();
    const pending = [document.entryStepKey];
    while (pending.length > 0) {
      const current = pending.pop();
      if (!current || reachable.has(current)) continue;
      reachable.add(current);
      pending.push(...(adjacency.get(current) ?? []));
    }

    document.steps.forEach((step, stepIndex) => {
      if (!reachable.has(step.key)) {
        issues.push(
          issue(
            "UNREACHABLE_STEP",
            `steps.${stepIndex}`,
            `Krok „${step.key}” jest nieosiągalny od kroku startowego.`,
          ),
        );
      }
    });

    if (hasCycle(adjacency, document.entryStepKey)) {
      issues.push(
        issue("FLOW_CYCLE", "steps", "Proces zawiera pętlę i nie może zostać opublikowany."),
      );
    }

    const hasTerminalPath = document.steps.some(
      (step) =>
        reachable.has(step.key) &&
        (step.nextStepKey === null || step.options.some((option) => option.nextStepKey === null)),
    );
    if (!hasTerminalPath) {
      issues.push(
        issue(
          "NO_TERMINAL_PATH",
          "steps",
          "Proces nie ma osiągalnej ścieżki kończącej się wynikiem.",
        ),
      );
    }
  }

  return { issues, valid: issues.length === 0 };
}

export function parseAndValidateFlowDocument(
  input: unknown,
):
  | Readonly<{ document: FlowDocument; result: FlowValidationResult; success: true }>
  | Readonly<{ errors: z.core.$ZodIssue[]; success: false }> {
  const parsed = storedFlowDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return { errors: parsed.error.issues, success: false };
  }
  const document = upgradeFlowDocument(parsed.data);
  return {
    document,
    result: validateFlowDocument(document),
    success: true,
  };
}
