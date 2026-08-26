import type {
  WidgetAnswer,
  WidgetConsentContent,
  WidgetManifest,
  WidgetOption,
  WidgetOptionPresentation,
  WidgetPresentationIcon,
  WidgetRule,
  WidgetStep,
  WidgetStepPresentation,
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
const presentationIcons = new Set<WidgetPresentationIcon>([
  "apartment",
  "building",
  "calendar",
  "camera",
  "check",
  "clock",
  "document",
  "door",
  "fence",
  "globe",
  "home",
  "kitchen",
  "layers",
  "location",
  "palette",
  "phone",
  "renovation",
  "ruler",
  "settings",
  "shopping_bag",
  "snowflake",
  "sparkles",
  "store",
  "wardrobe",
]);
const presentationVariants = new Set(["default", "text_cards", "icon_cards", "image_cards"]);

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

function parseOptionPresentation(value: unknown): WidgetOptionPresentation | null {
  if (value === null) return null;
  if (!isRecord(value)) throw new Error("Nieprawidłowa prezentacja opcji.");
  if (Object.keys(value).some((key) => !["asset", "description", "icon"].includes(key))) {
    throw new Error("Prezentacja opcji zawiera niedozwolone pole.");
  }

  const description = value.description;
  if (
    description !== undefined &&
    (typeof description !== "string" || description.trim().length === 0 || description.length > 180)
  ) {
    throw new Error("Nieprawidłowy opis prezentacji opcji.");
  }
  const icon = value.icon;
  if (
    icon !== undefined &&
    (typeof icon !== "string" || !presentationIcons.has(icon as WidgetPresentationIcon))
  ) {
    throw new Error("Nieobsługiwana ikona prezentacji opcji.");
  }
  const asset = value.asset;
  if (
    asset !== undefined &&
    (!isRecord(asset) ||
      Object.keys(asset).some((key) => !["alt", "id"].includes(key)) ||
      typeof asset.id !== "string" ||
      !uuidPattern.test(asset.id) ||
      typeof asset.alt !== "string" ||
      asset.alt.trim().length === 0 ||
      asset.alt.length > 160)
  ) {
    throw new Error("Nieprawidłowa referencja assetu prezentacji.");
  }
  if (description === undefined && icon === undefined && asset === undefined) {
    throw new Error("Prezentacja opcji nie może być pusta.");
  }

  return {
    ...(asset === undefined ? {} : { asset: { alt: asset.alt as string, id: asset.id as string } }),
    ...(description === undefined ? {} : { description }),
    ...(icon === undefined ? {} : { icon: icon as WidgetPresentationIcon }),
  };
}

function parseOption(value: unknown, manifestVersion: 1 | 2 | 3): WidgetOption {
  if (!isRecord(value)) throw new Error("Nieprawidłowa opcja manifestu.");
  const key = requiredString(value, "key", 64);
  if (!keyPattern.test(key)) throw new Error("Nieprawidłowy klucz opcji.");
  const presentation = value.presentation;
  if (manifestVersion === 3 && presentation === undefined) {
    throw new Error("Manifest v3 wymaga prezentacji opcji.");
  }
  if (manifestVersion !== 3 && presentation !== undefined) {
    throw new Error("Prezentacja opcji wymaga manifestu v3.");
  }
  return {
    key,
    label: requiredString(value, "label", 160),
    nextStepKey: nullableKey(value.nextStepKey),
    overridesNextStep: value.overridesNextStep === true,
    ...(manifestVersion === 3 ? { presentation: parseOptionPresentation(presentation) } : {}),
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

function parseStep(value: unknown, manifestVersion: 1 | 2 | 3): WidgetStep {
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
  const presentation = value.presentation;
  if (
    manifestVersion === 3 &&
    (!isRecord(presentation) ||
      Object.keys(presentation).some((key) => key !== "variant") ||
      typeof presentation.variant !== "string" ||
      !presentationVariants.has(presentation.variant))
  ) {
    throw new Error("Manifest v3 wymaga poprawnej prezentacji kroku.");
  }
  if (manifestVersion !== 3 && presentation !== undefined) {
    throw new Error("Prezentacja kroku wymaga manifestu v3.");
  }
  return {
    allowUnknown: value.allowUnknown,
    description,
    key,
    nextStepKey: nullableKey(value.nextStepKey),
    options: value.options.map((option) => parseOption(option, manifestVersion)),
    ...(manifestVersion === 3
      ? {
          presentation: {
            variant: (presentation as Record<string, unknown>)[
              "variant"
            ] as WidgetStepPresentation["variant"],
          },
        }
      : {}),
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

function parseChallenge(value: unknown): WidgetManifest["challenge"] {
  if (value === null || value === undefined) return null;
  if (
    !isRecord(value) ||
    value.action !== "kwotum_lead_submit" ||
    value.appearance !== "interaction-only" ||
    value.provider !== "turnstile" ||
    typeof value.siteKey !== "string" ||
    value.siteKey.length < 3 ||
    value.siteKey.length > 32 ||
    !/^[A-Za-z0-9_-]+$/.test(value.siteKey)
  ) {
    throw new Error("Nieprawidłowa konfiguracja zabezpieczenia formularza.");
  }
  return {
    action: value.action,
    appearance: value.appearance,
    provider: value.provider,
    siteKey: value.siteKey,
  };
}

function parseLeadCapture(value: unknown): WidgetManifest["leadCapture"] {
  if (value === null) return null;
  const schemaVersion = isRecord(value) ? value.leadCaptureSchemaVersion : null;
  if (
    !isRecord(value) ||
    (schemaVersion !== 1 && schemaVersion !== 2 && schemaVersion !== 3) ||
    typeof value.filesEnabled !== "boolean" ||
    !isRecord(value.privacyNotice)
  ) {
    throw new Error("Nieprawidłowa konfiguracja danych kontaktowych.");
  }
  const fields = schemaVersion === 3 && isRecord(value.fields) ? value.fields : null;
  const fieldState = (key: string): "hidden" | "optional" | "required" | null => {
    const candidate = fields?.[key];
    return candidate === "hidden" || candidate === "optional" || candidate === "required"
      ? candidate
      : null;
  };
  const parsedFields =
    schemaVersion === 3
      ? {
          email: fieldState("email"),
          name: fieldState("name"),
          phone: fieldState("phone"),
          preferredContactChannel: fieldState("preferredContactChannel"),
          preferredContactWindow: fieldState("preferredContactWindow"),
        }
      : null;
  if (parsedFields && Object.values(parsedFields).some((field) => field === null)) {
    throw new Error("Nieprawidłowa lista pól kontaktowych.");
  }
  const completionOrder =
    schemaVersion === 3 &&
    (value.completionOrder === "result_then_contact" ||
      value.completionOrder === "contact_then_result")
      ? value.completionOrder
      : null;
  if (schemaVersion === 3 && completionOrder === null) {
    throw new Error("Nieprawidłowa kolejność zakończenia.");
  }
  const contactPolicy =
    schemaVersion === 1
      ? "email_required"
      : schemaVersion === 3
        ? parsedFields?.email === "required"
          ? "email_required"
          : "phone_required"
        : value.contactPolicy === "email_required" || value.contactPolicy === "phone_required"
          ? value.contactPolicy
          : null;
  if (contactPolicy === null) {
    throw new Error("Nieprawidłowa polityka danych kontaktowych.");
  }
  const policyUrl = value.privacyNotice.policyUrl;
  if (
    policyUrl !== null &&
    (typeof policyUrl !== "string" || policyUrl.length > 500 || !policyUrl.startsWith("https://"))
  ) {
    throw new Error("Nieprawidłowy adres polityki prywatności.");
  }
  return {
    contactPolicy,
    ...(schemaVersion === 3
      ? {
          completionOrder: completionOrder!,
          fields: parsedFields as Exclude<
            NonNullable<WidgetManifest["leadCapture"]>["fields"],
            undefined
          >,
        }
      : {}),
    filesEnabled: value.filesEnabled,
    leadCaptureSchemaVersion: schemaVersion,
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
  if (
    !isRecord(value) ||
    (value.manifestVersion !== 1 && value.manifestVersion !== 2 && value.manifestVersion !== 3)
  ) {
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
  const manifestVersion = value.manifestVersion;
  const experienceMode = value.experienceMode;
  if (
    manifestVersion === 3 &&
    !["quick_form", "guided_brief", "visual_configurator"].includes(String(experienceMode))
  ) {
    throw new Error("Manifest v3 wymaga poprawnego trybu doświadczenia.");
  }
  if (manifestVersion !== 3 && experienceMode !== undefined) {
    throw new Error("Tryb doświadczenia wymaga manifestu v3.");
  }
  const entryStepKey = requiredString(value, "entryStepKey", 64);
  const steps = value.steps.map((step) => parseStep(step, manifestVersion));
  if (manifestVersion === 3) {
    for (const step of steps) {
      const variant = step.presentation?.variant;
      const isChoice = step.type === "single_choice" || step.type === "multiple_choice";
      const compatible =
        variant !== undefined &&
        (experienceMode === "visual_configurator" || variant === "default") &&
        (isChoice || variant === "default") &&
        (variant !== "default" || step.options.every((option) => option.presentation === null)) &&
        (variant !== "text_cards" ||
          step.options.every((option) => option.presentation?.description !== undefined)) &&
        (variant !== "icon_cards" ||
          step.options.every((option) => option.presentation?.icon !== undefined)) &&
        (variant !== "image_cards" ||
          step.options.every((option) => option.presentation?.asset !== undefined));
      if (!compatible) {
        throw new Error("Prezentacja manifestu nie pasuje do trybu, kroku lub opcji.");
      }
    }
  }
  const stepKeys = new Set(steps.map((step) => step.key));
  if (!keyPattern.test(entryStepKey) || !stepKeys.has(entryStepKey)) {
    throw new Error("Manifest nie ma poprawnego kroku startowego.");
  }
  if (
    experienceMode === "quick_form" &&
    (steps.length > 8 ||
      entryStepKey !== steps[0]?.key ||
      value.rules.length > 0 ||
      steps.some(
        (step, index) =>
          step.nextStepKey !== (steps[index + 1]?.key ?? null) ||
          step.options.some((option) => option.overridesNextStep),
      ))
  ) {
    throw new Error("Krótki formularz wymaga maksymalnie 8 pytań w jednej liniowej trasie.");
  }
  const mode = value.result.mode;
  if (mode !== "consultation" && mode !== "no_price") {
    throw new Error("Manifest ma nieobsługiwany wynik.");
  }
  if (
    typeof value.result.fallbackContactUrl === "string" &&
    !value.result.fallbackContactUrl.startsWith("https://")
  ) {
    throw new Error("Manifest ma nieprawidłowy kontakt awaryjny.");
  }
  const branding = isRecord(value.branding) ? value.branding : null;
  if (branding) {
    const accent = requiredString(branding, "accentColor", 7);
    const text = requiredString(branding, "accentTextColor", 7);
    const logo = branding.logoUrl;
    const red = Number.parseInt(accent.slice(1, 3), 16);
    const green = Number.parseInt(accent.slice(3, 5), 16);
    const blue = Number.parseInt(accent.slice(5, 7), 16);
    const expected = red * 299 + green * 587 + blue * 114 >= 150_000 ? "#000000" : "#FFFFFF";
    if (
      !/^#[0-9A-F]{6}$/.test(accent) ||
      text !== expected ||
      (logo !== null &&
        (typeof logo !== "string" ||
          !/^\/api\/v1\/public\/flows\/[0-9a-f-]{36}\/brand-logo$/.test(logo)))
    ) {
      throw new Error("Nieprawidłowa konfiguracja brandingu.");
    }
  }
  return {
    ...(branding
      ? {
          branding: {
            accentColor: requiredString(branding, "accentColor", 7),
            accentTextColor: requiredString(branding, "accentTextColor", 7) as
              "#000000" | "#FFFFFF",
            companyName: requiredString(branding, "companyName", 120),
            logoUrl: branding.logoUrl === null ? null : requiredString(branding, "logoUrl", 240),
          },
        }
      : {}),
    challenge: parseChallenge(value.challenge),
    entryStepKey,
    ...(manifestVersion === 3
      ? {
          experienceMode: experienceMode as "quick_form" | "guided_brief" | "visual_configurator",
        }
      : {}),
    intro: requiredString(value, "intro", 800),
    leadCapture: parseLeadCapture(value.leadCapture),
    manifestVersion,
    publicId: value.publicId,
    publishedAt: value.publishedAt,
    result: {
      ...(value.result.action === "capture_lead" || value.result.action === "no_lead"
        ? { action: value.result.action }
        : {}),
      disclaimer: requiredString(value.result, "disclaimer", 800),
      ...(typeof value.result.fallbackContactLabel === "string"
        ? { fallbackContactLabel: requiredString(value.result, "fallbackContactLabel", 120) }
        : {}),
      ...(typeof value.result.fallbackContactUrl === "string"
        ? { fallbackContactUrl: requiredString(value.result, "fallbackContactUrl", 500) }
        : {}),
      headline: requiredString(value.result, "headline", 240),
      mode,
      nextStepLabel: requiredString(value.result, "nextStepLabel", 120),
      ...(value.result.resultSchemaVersion === 2 ? { resultSchemaVersion: 2 as const } : {}),
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
