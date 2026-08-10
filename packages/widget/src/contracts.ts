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
}>;

export type WidgetStep = Readonly<{
  allowUnknown: boolean;
  description: string | null;
  key: string;
  nextStepKey: string | null;
  options: WidgetOption[];
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
  entryStepKey: string;
  intro: string;
  leadCapture: Readonly<{
    filesEnabled: boolean;
    leadCaptureSchemaVersion: 1;
    marketingEmailConsent: WidgetConsentContent | null;
    privacyNotice: WidgetConsentContent &
      Readonly<{
        policyUrl: string | null;
      }>;
  }> | null;
  manifestVersion: 1 | 2;
  publicId: string;
  publishedAt: string;
  result: Readonly<{
    disclaimer: string;
    headline: string;
    mode: "consultation" | "no_price";
    nextStepLabel: string;
  }>;
  rules: WidgetRule[];
  snapshotHash: string;
  steps: WidgetStep[];
  title: string;
}>;

export type WidgetSessionSnapshot = Readonly<{
  answers: Record<string, WidgetAnswer>;
  currentStepKey: string | null;
  expiresAt: string;
  manifest: WidgetManifest;
  revision: number;
}>;

export type CreatedWidgetSession = Readonly<{
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
  disclaimer: string;
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
  contact: Readonly<{
    email: string;
    name?: string;
    phone?: string;
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
  createSession(publicId: string): Promise<CreatedWidgetSession>;
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
  "CONFLICT" | "EXPIRED" | "INVALID" | "NETWORK" | "NOT_FOUND" | "RATE_LIMITED" | "UNAVAILABLE";

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
