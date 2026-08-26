export type WidgetAnswer = boolean | number | string | string[];

export type WidgetStepType =
  | "budget"
  | "date"
  | "location"
  | "long_text"
  | "multiple_choice"
  | "number"
  | "short_text"
  | "single_choice"
  | "yes_no";

export type WidgetStepValidation =
  | Readonly<{
      kind: "date_range";
      max?: string;
      min?: string;
    }>
  | Readonly<{
      kind: "number_range";
      max?: number;
      min?: number;
    }>
  | Readonly<{
      kind: "text_length";
      maxLength: number;
      minLength: number;
    }>;

export type WidgetOption = Readonly<{
  key: string;
  label: string;
  nextStepKey: string | null;
  overridesNextStep: boolean;
  presentation?: WidgetOptionPresentation | null;
}>;

export type WidgetPresentationIcon =
  | "apartment"
  | "building"
  | "calendar"
  | "camera"
  | "check"
  | "clock"
  | "document"
  | "door"
  | "fence"
  | "globe"
  | "home"
  | "kitchen"
  | "layers"
  | "location"
  | "palette"
  | "phone"
  | "renovation"
  | "ruler"
  | "settings"
  | "shopping_bag"
  | "snowflake"
  | "sparkles"
  | "store"
  | "wardrobe";

export type WidgetOptionPresentation = Readonly<{
  asset?: Readonly<{ alt: string; id: string }>;
  description?: string;
  icon?: WidgetPresentationIcon;
}>;

export type WidgetStepPresentation = Readonly<{
  variant: "default" | "text_cards" | "icon_cards" | "image_cards";
}>;

export type WidgetStep = Readonly<{
  allowUnknown: boolean;
  description: string | null;
  key: string;
  nextStepKey: string | null;
  options: WidgetOption[];
  presentation?: WidgetStepPresentation;
  required: boolean;
  title: string;
  type: WidgetStepType;
  validation: WidgetStepValidation | null;
}>;

export type WidgetRule = Readonly<{
  id: string;
  then: Readonly<{ action: "go_to"; stepKey: string | null }>;
  when: Readonly<{
    operator: "answered" | "equals" | "includes" | "not_equals";
    stepKey: string;
    value?: boolean | number | string;
  }>;
}>;

export type WidgetConsentContent = Readonly<{
  label: string;
  textHash: string;
  version: string;
}>;

export type WidgetManifest = Readonly<{
  branding?: Readonly<{
    accentColor: string;
    accentTextColor: "#000000" | "#FFFFFF";
    companyName: string;
    logoUrl: string | null;
  }>;
  challenge: Readonly<{
    action: "kwotum_lead_submit";
    appearance: "interaction-only";
    provider: "turnstile";
    siteKey: string;
  }> | null;
  entryStepKey: string;
  experienceMode?: "quick_form" | "guided_brief" | "visual_configurator";
  intro: string;
  leadCapture: Readonly<{
    contactPolicy: "email_required" | "phone_required";
    completionOrder?: "result_then_contact" | "contact_then_result";
    fields?: Readonly<{
      email: "hidden" | "optional" | "required";
      name: "hidden" | "optional" | "required";
      phone: "hidden" | "optional" | "required";
      preferredContactChannel: "hidden" | "optional" | "required";
      preferredContactWindow: "hidden" | "optional" | "required";
    }>;
    filesEnabled: boolean;
    leadCaptureSchemaVersion: 1 | 2 | 3;
    marketingEmailConsent: WidgetConsentContent | null;
    privacyNotice: WidgetConsentContent &
      Readonly<{
        policyUrl: string | null;
      }>;
  }> | null;
  manifestVersion: 1 | 2 | 3;
  publicId: string;
  publishedAt: string;
  result: Readonly<{
    action?: "capture_lead" | "no_lead";
    disclaimer: string;
    fallbackContactLabel?: string;
    fallbackContactUrl?: string;
    headline: string;
    mode: "consultation" | "no_price";
    nextStepLabel: string;
    resultSchemaVersion?: 2;
  }>;
  rules: WidgetRule[];
  snapshotHash: string;
  steps: WidgetStep[];
  title: string;
}>;

export type WidgetContextValue = Readonly<{
  allowedValues: readonly string[] | null;
  key: string;
  label: string;
  mode: "confirm" | "informational";
  type: "enum" | "text";
  value: string;
}>;

export type WidgetContextInput = Readonly<Record<string, string>>;

export type WidgetSessionSnapshot = Readonly<{
  answers: Record<string, WidgetAnswer>;
  context: WidgetContextValue[];
  contextConfirmed: boolean;
  currentStepKey: string | null;
  expiresAt: string;
  manifest: WidgetManifest;
  revision: number;
}>;

export type CreatedWidgetSession = Readonly<{
  context: WidgetContextValue[];
  contextConfirmed: boolean;
  currentStepKey: string;
  expiresAt: string;
  manifest: WidgetManifest;
  revision: number;
  token: string;
}>;

export type SaveAnswerInput = Readonly<{
  answer: WidgetAnswer | null;
  expectedRevision: number;
  mutationId: string;
  nextStepKey: string | null;
  stepKey: string;
  token: string;
}>;

export type SavedWidgetAnswer = Readonly<{
  currentStepKey: string | null;
  revision: number;
}>;

export type WidgetCalculatedResult = Readonly<{
  action: "capture_lead" | "no_lead";
  disclaimer: string;
  fallbackContactLabel: string | null;
  fallbackContactUrl: string | null;
  headline: string;
  nextStepLabel: string;
  pricing: Readonly<{
    currency: string;
    formattedMax: string;
    formattedMin: string;
    maxMinor: number;
    minMinor: number;
    presentation: "exact" | "from" | "range";
  }> | null;
}>;

export type UploadedWidgetFile = Readonly<{
  fileId: string;
  mimeType: string;
  name: string;
  sizeBytes: number;
}>;

export type SubmitLeadInput = Readonly<{
  challengeToken: string;
  contact: Readonly<{
    email?: string;
    name?: string;
    phone?: string;
    preferredContactChannel?: "email" | "phone";
    preferredContactWindow?: "morning" | "afternoon" | "evening";
  }>;
  fileIds: string[];
  marketingEmailConsent: Readonly<{
    accepted: true;
    textHash: string;
    version: string;
  }> | null;
  mutationId: string;
  privacyNotice: Readonly<{
    accepted: true;
    textHash: string;
    version: string;
  }>;
  token: string;
}>;

export type WidgetSubmission = Readonly<{
  leadPublicId: string;
  submittedAt: string;
}>;

export type WidgetAnalyticsEventName =
  | "contact_started"
  | "cta_clicked"
  | "file_uploaded"
  | "flow_abandoned"
  | "flow_started"
  | "lead_submitted"
  | "result_viewed"
  | "step_answered"
  | "step_back"
  | "step_viewed"
  | "validation_error"
  | "widget_loaded"
  | "widget_opened";

export type WidgetAnalyticsEvent = Readonly<{
  device: "desktop" | "mobile" | "other" | "tablet";
  eventId: string;
  name: WidgetAnalyticsEventName;
  occurredAt: string;
  schemaVersion: 1;
  source: "direct" | "email" | "organic" | "other" | "paid" | "referral" | "social";
  stepKey: string | null;
  token: string;
}>;

export interface WidgetApi {
  confirmContext(input: {
    mutationId: string;
    token: string;
    values: WidgetContextInput;
  }): Promise<WidgetContextValue[]>;
  createSession(publicId: string, context: WidgetContextInput): Promise<CreatedWidgetSession>;
  getManifest(publicId: string): Promise<WidgetManifest>;
  getResult(token: string): Promise<WidgetCalculatedResult>;
  resumeSession(token: string): Promise<WidgetSessionSnapshot>;
  saveAnswer(input: SaveAnswerInput): Promise<SavedWidgetAnswer>;
  setAnalyticsConsent(input: {
    consentVersion: "analytics-v1";
    granted: boolean;
    mutationId: string;
    token: string;
  }): Promise<void>;
  submitLead(input: SubmitLeadInput): Promise<WidgetSubmission>;
  trackAnalyticsEvent(input: WidgetAnalyticsEvent): Promise<void>;
  uploadFile(file: File, token: string): Promise<UploadedWidgetFile>;
}

export type WidgetApiErrorCode =
  | "CHALLENGE"
  | "CONFLICT"
  | "EXPIRED"
  | "INVALID"
  | "NETWORK"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UNAVAILABLE";

export class WidgetApiError extends Error {
  readonly code: WidgetApiErrorCode;

  constructor(code: WidgetApiErrorCode, message: string) {
    super(message);
    this.name = "WidgetApiError";
    this.code = code;
  }
}

export function isWidgetApiError(error: unknown, code?: WidgetApiErrorCode): boolean {
  return error instanceof WidgetApiError && (code === undefined || error.code === code);
}
