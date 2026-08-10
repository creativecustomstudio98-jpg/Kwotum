import type {
  WidgetAnswer,
  WidgetConsentContent,
  WidgetManifest,
  WidgetOption,
  WidgetRule,
  WidgetStep,
  WidgetStepValidation,
  WidgetStepType,
} from "./contracts.js";

const keyPattern = /^[a-z][a-z0-9_]{0,63}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const hashPattern = /^[a-f0-9]{64}$/;
const stepTypes = new Set<WidgetStepType>([
  "budget",
  "date",
  "location",
  "long_text",
  "multiple_choice",
  "number",
  "short_text",
  "single_choice",
  "yes_no",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(record: Record<string, unknown>, key: string, maxLength: number): string {
  const value = record[key];
  if (typeof value !== "string" || value.trim().length === 0 || value.length > maxLength) {
    throw new Error(`Nieprawidłowe pole manifestu: ${key}.`);
  }
  return value;
}

function nullableKey(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string" || !keyPattern.test(value)) {
    throw new Error("Nieprawidłowy cel przejścia w manifeście.");
  }
  return value;
}

function parseOption(value: unknown): WidgetOption {
  if (!isRecord(value)) throw new Error("Nieprawidłowa opcja manifestu.");
  const key = requiredString(value, "key", 64);
  if (!keyPattern.test(key)) throw new Error("Nieprawidłowy klucz opcji.");
  return {
    key,
    label: requiredString(value, "label", 160),
    nextStepKey: nullableKey(value.nextStepKey),
    overridesNextStep: value.overridesNextStep === true,
  };
}

function optionalFiniteNumber(value: unknown, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Nieprawidłowe ograniczenie: ${field}.`);
  }
  return value;
}

function optionalIsoDate(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Nieprawidłowe ograniczenie: ${field}.`);
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`Nieprawidłowe ograniczenie: ${field}.`);
  }
  return value;
}

function parseStepValidation(value: unknown, type: WidgetStepType): WidgetStepValidation | null {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) throw new Error("Nieprawidłowa walidacja kroku.");

  if (value.kind === "text_length") {
    if (!["location", "long_text", "short_text"].includes(type)) {
      throw new Error("Walidacja tekstu nie pasuje do typu kroku.");
    }
    const { maxLength, minLength } = value;
    const typeMaxLength = type === "long_text" ? 2000 : 500;
    if (
      typeof minLength !== "number" ||
      !Number.isInteger(minLength) ||
      minLength < 0 ||
      typeof maxLength !== "number" ||
      !Number.isInteger(maxLength) ||
      maxLength < 1 ||
      maxLength > typeMaxLength ||
      minLength > maxLength
    ) {
      throw new Error("Nieprawidłowy zakres długości tekstu.");
    }
    return { kind: "text_length", maxLength, minLength };
  }

  if (value.kind === "number_range") {
    if (type !== "budget" && type !== "number") {
      throw new Error("Walidacja liczbowa nie pasuje do typu kroku.");
    }
    const min = optionalFiniteNumber(value.min, "min");
    const max = optionalFiniteNumber(value.max, "max");
    if (
      (min === undefined && max === undefined) ||
      (min !== undefined && max !== undefined && min > max)
    ) {
      throw new Error("Nieprawidłowy zakres liczbowy.");
    }
    return {
      kind: "number_range",
      ...(max === undefined ? {} : { max }),
      ...(min === undefined ? {} : { min }),
    };
  }

  if (value.kind === "date_range") {
    if (type !== "date") throw new Error("Walidacja daty nie pasuje do typu kroku.");
    const min = optionalIsoDate(value.min, "min");
    const max = optionalIsoDate(value.max, "max");
    if (
      (min === undefined && max === undefined) ||
      (min !== undefined && max !== undefined && min > max)
    ) {
      throw new Error("Nieprawidłowy zakres dat.");
    }
    return {
      kind: "date_range",
      ...(max === undefined ? {} : { max }),
      ...(min === undefined ? {} : { min }),
    };
  }

  throw new Error("Nieobsługiwany typ walidacji kroku.");
}

function parseStep(value: unknown): WidgetStep {
  if (!isRecord(value)) throw new Error("Nieprawidłowy krok manifestu.");
  const key = requiredString(value, "key", 64);
  const type = value.type;
  if (!keyPattern.test(key) || typeof type !== "string" || !stepTypes.has(type as WidgetStepType)) {
    throw new Error("Nieprawidłowy klucz lub typ kroku.");
  }
  if (
    typeof value.required !== "boolean" ||
    typeof value.allowUnknown !== "boolean" ||
    !Array.isArray(value.options) ||
    value.options.length > 20
  ) {
    throw new Error("Nieprawidłowa konfiguracja kroku.");
  }
  const description = value.description;
  if (description !== null && (typeof description !== "string" || description.length > 500)) {
    throw new Error("Nieprawidłowy opis kroku.");
  }
  return {
    allowUnknown: value.allowUnknown,
    description,
    key,
    nextStepKey: nullableKey(value.nextStepKey),
    options: value.options.map(parseOption),
    required: value.required,
    title: requiredString(value, "title", 240),
    type: type as WidgetStepType,
    validation: parseStepValidation(value.validation, type as WidgetStepType),
  };
}

function parseRule(value: unknown): WidgetRule {
  if (!isRecord(value) || !isRecord(value.when) || !isRecord(value.then)) {
    throw new Error("Nieprawidłowa reguła manifestu.");
  }
  const id = requiredString(value, "id", 64);
  const stepKey = requiredString(value.when, "stepKey", 64);
  const operator = value.when.operator;
  const target = nullableKey(value.then.stepKey);
  if (
    !keyPattern.test(id) ||
    !keyPattern.test(stepKey) ||
    !["answered", "equals", "includes", "not_equals"].includes(String(operator)) ||
    value.then.action !== "go_to"
  ) {
    throw new Error("Nieprawidłowa reguła nawigacji.");
  }
  const conditionValue = value.when.value;
  if (
    conditionValue !== null &&
    conditionValue !== undefined &&
    !["boolean", "number", "string"].includes(typeof conditionValue)
  ) {
    throw new Error("Nieprawidłowa wartość reguły.");
  }
  return {
    id,
    then: { action: "go_to", stepKey: target },
    when: {
      operator: operator as WidgetRule["when"]["operator"],
      stepKey,
      ...(conditionValue === null || conditionValue === undefined
        ? {}
        : { value: conditionValue as boolean | number | string }),
    },
  };
}

function parseConsentContent(value: unknown): WidgetConsentContent {
  if (!isRecord(value)) throw new Error("Nieprawidłowa treść zgody.");
  const textHash = requiredString(value, "textHash", 64);
  if (!hashPattern.test(textHash)) throw new Error("Nieprawidłowy hash treści zgody.");
  return {
    label: requiredString(value, "label", 500),
    textHash,
    version: requiredString(value, "version", 80),
  };
}

function parseLeadCapture(value: unknown): WidgetManifest["leadCapture"] {
  if (value === null) return null;
  if (
    !isRecord(value) ||
    value.leadCaptureSchemaVersion !== 1 ||
    typeof value.filesEnabled !== "boolean" ||
    !isRecord(value.privacyNotice)
  ) {
    throw new Error("Nieprawidłowa konfiguracja danych kontaktowych.");
  }
  const policyUrl = value.privacyNotice.policyUrl;
  if (
    policyUrl !== null &&
    (typeof policyUrl !== "string" || policyUrl.length > 500 || !policyUrl.startsWith("https://"))
  ) {
    throw new Error("Nieprawidłowy adres polityki prywatności.");
  }
  return {
    filesEnabled: value.filesEnabled,
    leadCaptureSchemaVersion: 1,
    marketingEmailConsent:
      value.marketingEmailConsent === null
        ? null
        : parseConsentContent(value.marketingEmailConsent),
    privacyNotice: {
      ...parseConsentContent(value.privacyNotice),
      policyUrl,
    },
  };
}

export function parseWidgetManifest(value: unknown): WidgetManifest {
  if (!isRecord(value) || (value.manifestVersion !== 1 && value.manifestVersion !== 2)) {
    throw new Error("Nieobsługiwana wersja manifestu.");
  }
  if (
    typeof value.publicId !== "string" ||
    !uuidPattern.test(value.publicId) ||
    typeof value.snapshotHash !== "string" ||
    !hashPattern.test(value.snapshotHash) ||
    typeof value.publishedAt !== "string" ||
    !Array.isArray(value.steps) ||
    value.steps.length < 1 ||
    value.steps.length > 40 ||
    !Array.isArray(value.rules) ||
    value.rules.length > 50 ||
    !isRecord(value.result)
  ) {
    throw new Error("Manifest ma nieprawidłową strukturę.");
  }
  const entryStepKey = requiredString(value, "entryStepKey", 64);
  const steps = value.steps.map(parseStep);
  const stepKeys = new Set(steps.map((step) => step.key));
  if (!keyPattern.test(entryStepKey) || !stepKeys.has(entryStepKey)) {
    throw new Error("Manifest nie ma poprawnego kroku startowego.");
  }
  const mode = value.result.mode;
  if (mode !== "consultation" && mode !== "no_price") {
    throw new Error("Manifest ma nieobsługiwany wynik.");
  }
  return {
    entryStepKey,
    intro: requiredString(value, "intro", 800),
    leadCapture: parseLeadCapture(value.leadCapture),
    manifestVersion: value.manifestVersion,
    publicId: value.publicId,
    publishedAt: value.publishedAt,
    result: {
      disclaimer: requiredString(value.result, "disclaimer", 800),
      headline: requiredString(value.result, "headline", 240),
      mode,
      nextStepLabel: requiredString(value.result, "nextStepLabel", 120),
    },
    rules: value.rules.map(parseRule),
    snapshotHash: value.snapshotHash,
    steps,
    title: requiredString(value, "title", 160),
  };
}

export function isAnswerValid(step: WidgetStep, answer: WidgetAnswer | null): boolean {
  if (answer === null) return !step.required;
  if (answer === "__unknown__") return step.allowUnknown;
  if (step.type === "single_choice") {
    return typeof answer === "string" && step.options.some((option) => option.key === answer);
  }
  if (step.type === "multiple_choice") {
    return (
      Array.isArray(answer) &&
      answer.length > 0 &&
      answer.length <= 20 &&
      new Set(answer).size === answer.length &&
      answer.every((selected) => step.options.some((option) => option.key === selected))
    );
  }
  if (step.type === "yes_no") return typeof answer === "boolean";
  if (step.type === "number" || step.type === "budget") {
    if (typeof answer !== "number" || !Number.isFinite(answer)) return false;
    if (step.validation?.kind !== "number_range") return true;
    return (
      (step.validation.min === undefined || answer >= step.validation.min) &&
      (step.validation.max === undefined || answer <= step.validation.max)
    );
  }
  if (step.type === "date" && typeof answer === "string" && /^\d{4}-\d{2}-\d{2}$/.test(answer)) {
    const parsed = new Date(`${answer}T00:00:00Z`);
    if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== answer) {
      return false;
    }
    if (step.validation?.kind !== "date_range") return true;
    return (
      (step.validation.min === undefined || answer >= step.validation.min) &&
      (step.validation.max === undefined || answer <= step.validation.max)
    );
  }
  const maxLength = step.type === "long_text" ? 2000 : 500;
  if (typeof answer !== "string") return false;
  const normalizedLength = answer.trim().length;
  if (normalizedLength < 1 || answer.length > maxLength) return false;
  if (step.validation?.kind !== "text_length") return true;
  return (
    normalizedLength >= step.validation.minLength && normalizedLength <= step.validation.maxLength
  );
}

function conditionMatches(
  rule: WidgetRule,
  answers: Readonly<Record<string, WidgetAnswer>>,
): boolean {
  const actual = answers[rule.when.stepKey];
  if (rule.when.operator === "answered") return actual !== undefined;
  if (rule.when.operator === "includes") {
    return Array.isArray(actual) && actual.includes(String(rule.when.value));
  }
  const equals = actual === rule.when.value;
  return rule.when.operator === "equals" ? equals : !equals;
}

export function resolveNextStep(
  manifest: WidgetManifest,
  currentStepKey: string,
  answers: Readonly<Record<string, WidgetAnswer>>,
): string | null {
  const step = manifest.steps.find((candidate) => candidate.key === currentStepKey);
  if (!step) throw new Error("Bieżący krok nie istnieje w manifeście.");

  const matchingRule = manifest.rules.find(
    (rule) => rule.when.stepKey === currentStepKey && conditionMatches(rule, answers),
  );
  if (matchingRule) return matchingRule.then.stepKey;

  const selected = answers[currentStepKey];
  if (step.type === "single_choice" && typeof selected === "string") {
    const selectedOption = step.options.find((option) => option.key === selected);
    if (selectedOption?.overridesNextStep) return selectedOption.nextStepKey;
  }
  return step.nextStepKey;
}
