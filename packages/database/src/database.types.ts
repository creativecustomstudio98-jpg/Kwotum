export type Json = boolean | number | string | null | Json[] | { [key: string]: Json | undefined };

export type OrganizationMemberRole = "owner" | "admin" | "sales";
export type OrganizationMemberStatus = "invited" | "active" | "suspended";
export type FlowVersionStatus = "archived" | "published";
export type FlowInvitationStatus = "failed" | "pending" | "processing" | "retry" | "sent";
export type WidgetSessionStatus = "active" | "expired";
export type LeadStatus = "in_progress" | "lost" | "new" | "qualified" | "spam" | "won";
export type LeadPriority = "high" | "low" | "medium";
export type LeadTaskKind = "contact" | "task";
export type LeadTaskStatus = "cancelled" | "completed" | "open";
export type LeadActivityKind =
  "assignee_changed" | "priority_changed" | "task_cancelled" | "task_completed" | "task_created";
export type ConsentRecordType = "marketing_email" | "privacy_notice";
export type LeadFileStatus = "pending" | "rejected" | "verified";
export type NotificationKind = "lead_company_alert" | "lead_customer_confirmation";
export type NotificationStatus = "failed" | "pending" | "processing" | "retry" | "sent";
export type NotificationAttemptOutcome = "failed" | "retry" | "sent";
export type NotificationErrorCode =
  | "configuration"
  | "network"
  | "provider_4xx"
  | "provider_429"
  | "provider_5xx"
  | "provider_invalid_response"
  | "recipient_unavailable"
  | "worker_timeout";
export type WebhookEndpointStatus = "disabled" | "enabled";
export type WebhookDeliveryStatus =
  "dead_letter" | "delivered" | "pending" | "processing" | "retry";
export type WebhookAttemptOutcome = "dead_letter" | "delivered" | "retry";
export type WebhookErrorCode =
  | "configuration"
  | "dns_resolution"
  | "endpoint_disabled"
  | "http_408"
  | "http_425"
  | "http_429"
  | "http_4xx"
  | "http_5xx"
  | "invalid_response"
  | "network"
  | "redirect"
  | "secret_rotated"
  | "timeout"
  | "tls"
  | "unsafe_target"
  | "worker_timeout";
export type AnalyticsConsentState = "denied" | "granted";
export type AnalyticsDevice = "desktop" | "mobile" | "other" | "tablet";
export type AnalyticsSource =
  "direct" | "email" | "organic" | "other" | "paid" | "referral" | "social";
export type AnalyticsEventName =
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
export type DataErasureReason = "data_subject_request" | "retention";

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationship[];
};

export type Database = {
  public: {
    Tables: {
      analytics_consent_records: Table<
        {
          consent_version: string;
          id: string;
          mutation_id: string;
          organization_id: string;
          recorded_at: string;
          session_id: string;
          state: AnalyticsConsentState;
        },
        {
          consent_version: string;
          id?: string;
          mutation_id: string;
          organization_id: string;
          recorded_at?: string;
          session_id: string;
          state: AnalyticsConsentState;
        },
        {
          consent_version?: string;
          id?: string;
          mutation_id?: string;
          organization_id?: string;
          recorded_at?: string;
          session_id?: string;
          state?: AnalyticsConsentState;
        }
      >;
      audit_logs: Table<
        {
          action: string;
          actor_user_id: string | null;
          created_at: string;
          id: string;
          metadata: Json;
          organization_id: string;
          target_id: string | null;
          target_table: string;
        },
        {
          action: string;
          actor_user_id?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json;
          organization_id: string;
          target_id?: string | null;
          target_table: string;
        },
        {
          action?: string;
          actor_user_id?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json;
          organization_id?: string;
          target_id?: string | null;
          target_table?: string;
        }
      >;
      data_erasure_events: Table<
        {
          erased_at: string;
          id: string;
          organization_id: string;
          reason: DataErasureReason;
          requested_by: string | null;
          summary: Json;
        },
        {
          erased_at?: string;
          id?: string;
          organization_id: string;
          reason: DataErasureReason;
          requested_by?: string | null;
          summary: Json;
        },
        {
          erased_at?: string;
          id?: string;
          organization_id?: string;
          reason?: DataErasureReason;
          requested_by?: string | null;
          summary?: Json;
        }
      >;
      flows: Table<
        {
          created_at: string;
          created_by: string;
          draft: Json;
          draft_revision: number;
          id: string;
          name: string;
          organization_id: string;
          slug: string;
          updated_at: string;
          updated_by: string;
        },
        {
          created_at?: string;
          created_by: string;
          draft: Json;
          draft_revision?: number;
          id?: string;
          name: string;
          organization_id: string;
          slug: string;
          updated_at?: string;
          updated_by: string;
        },
        {
          created_at?: string;
          created_by?: string;
          draft?: Json;
          draft_revision?: number;
          id?: string;
          name?: string;
          organization_id?: string;
          slug?: string;
          updated_at?: string;
          updated_by?: string;
        }
      >;
      flow_versions: Table<
        {
          archived_at: string | null;
          archived_by: string | null;
          flow_id: string;
          id: string;
          organization_id: string;
          published_at: string;
          published_by: string;
          snapshot: Json;
          snapshot_hash: string;
          status: FlowVersionStatus;
          version_number: number;
        },
        {
          archived_at?: string | null;
          archived_by?: string | null;
          flow_id: string;
          id?: string;
          organization_id: string;
          published_at?: string;
          published_by: string;
          snapshot: Json;
          snapshot_hash: string;
          status?: FlowVersionStatus;
          version_number: number;
        },
        {
          archived_at?: string | null;
          archived_by?: string | null;
          flow_id?: string;
          id?: string;
          organization_id?: string;
          published_at?: string;
          published_by?: string;
          snapshot?: Json;
          snapshot_hash?: string;
          status?: FlowVersionStatus;
          version_number?: number;
        }
      >;
      consent_records: Table<
        {
          accepted: boolean;
          content_hash: string;
          content_version: string;
          id: string;
          lead_id: string;
          organization_id: string;
          recorded_at: string;
          source: string;
          type: ConsentRecordType;
        },
        {
          accepted: boolean;
          content_hash: string;
          content_version: string;
          id?: string;
          lead_id: string;
          organization_id: string;
          recorded_at?: string;
          source?: string;
          type: ConsentRecordType;
        },
        {
          accepted?: boolean;
          content_hash?: string;
          content_version?: string;
          id?: string;
          lead_id?: string;
          organization_id?: string;
          recorded_at?: string;
          source?: string;
          type?: ConsentRecordType;
        }
      >;
      lead_answers: Table<
        {
          answer: Json;
          created_at: string;
          id: string;
          lead_id: string;
          organization_id: string;
          question_title: string;
          step_key: string;
        },
        {
          answer: Json;
          created_at?: string;
          id?: string;
          lead_id: string;
          organization_id: string;
          question_title: string;
          step_key: string;
        },
        {
          answer?: Json;
          created_at?: string;
          id?: string;
          lead_id?: string;
          organization_id?: string;
          question_title?: string;
          step_key?: string;
        }
      >;
      lead_files: Table<
        {
          created_at: string;
          id: string;
          lead_id: string | null;
          mime_type: string;
          object_path: string;
          organization_id: string;
          original_name: string;
          session_id: string;
          sha256: string;
          size_bytes: number;
          status: LeadFileStatus;
          verified_at: string | null;
        },
        {
          created_at?: string;
          id?: string;
          lead_id?: string | null;
          mime_type: string;
          object_path: string;
          organization_id: string;
          original_name: string;
          session_id: string;
          sha256: string;
          size_bytes: number;
          status?: LeadFileStatus;
          verified_at?: string | null;
        },
        {
          created_at?: string;
          id?: string;
          lead_id?: string | null;
          mime_type?: string;
          object_path?: string;
          organization_id?: string;
          original_name?: string;
          session_id?: string;
          sha256?: string;
          size_bytes?: number;
          status?: LeadFileStatus;
          verified_at?: string | null;
        }
      >;
      lead_activity_events: Table<
        {
          actor_user_id: string | null;
          from_value: string | null;
          id: string;
          kind: LeadActivityKind;
          lead_id: string;
          occurred_at: string;
          organization_id: string;
          task_id: string | null;
          to_value: string | null;
        },
        {
          actor_user_id?: string | null;
          from_value?: string | null;
          id?: string;
          kind: LeadActivityKind;
          lead_id: string;
          occurred_at?: string;
          organization_id: string;
          task_id?: string | null;
          to_value?: string | null;
        },
        {
          actor_user_id?: string | null;
          from_value?: string | null;
          id?: string;
          kind?: LeadActivityKind;
          lead_id?: string;
          occurred_at?: string;
          organization_id?: string;
          task_id?: string | null;
          to_value?: string | null;
        }
      >;
      lead_notes: Table<
        {
          body: string;
          created_at: string;
          created_by: string;
          id: string;
          lead_id: string;
          organization_id: string;
        },
        {
          body: string;
          created_at?: string;
          created_by: string;
          id?: string;
          lead_id: string;
          organization_id: string;
        },
        {
          body?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          lead_id?: string;
          organization_id?: string;
        }
      >;
      lead_legal_holds: Table<
        {
          created_at: string;
          created_by: string;
          lead_id: string;
          organization_id: string;
          reason: string;
        },
        {
          created_at?: string;
          created_by: string;
          lead_id: string;
          organization_id: string;
          reason: string;
        },
        {
          created_at?: string;
          created_by?: string;
          lead_id?: string;
          organization_id?: string;
          reason?: string;
        }
      >;
      lead_operations: Table<
        {
          assignee_user_id: string | null;
          lead_id: string;
          organization_id: string;
          priority: LeadPriority;
          updated_at: string;
          updated_by: string | null;
        },
        {
          assignee_user_id?: string | null;
          lead_id: string;
          organization_id: string;
          priority?: LeadPriority;
          updated_at?: string;
          updated_by?: string | null;
        },
        {
          assignee_user_id?: string | null;
          lead_id?: string;
          organization_id?: string;
          priority?: LeadPriority;
          updated_at?: string;
          updated_by?: string | null;
        }
      >;
      lead_status_history: Table<
        {
          changed_at: string;
          changed_by: string | null;
          from_status: LeadStatus | null;
          id: string;
          lead_id: string;
          organization_id: string;
          to_status: LeadStatus;
        },
        {
          changed_at?: string;
          changed_by?: string | null;
          from_status?: LeadStatus | null;
          id?: string;
          lead_id: string;
          organization_id: string;
          to_status: LeadStatus;
        },
        {
          changed_at?: string;
          changed_by?: string | null;
          from_status?: LeadStatus | null;
          id?: string;
          lead_id?: string;
          organization_id?: string;
          to_status?: LeadStatus;
        }
      >;
      lead_tasks: Table<
        {
          assigned_to: string | null;
          closed_at: string | null;
          closed_by: string | null;
          created_at: string;
          created_by: string;
          description: string | null;
          due_at: string;
          id: string;
          kind: LeadTaskKind;
          lead_id: string;
          organization_id: string;
          request_id: string;
          status: LeadTaskStatus;
          title: string;
          updated_at: string;
        },
        {
          assigned_to?: string | null;
          closed_at?: string | null;
          closed_by?: string | null;
          created_at?: string;
          created_by: string;
          description?: string | null;
          due_at: string;
          id?: string;
          kind: LeadTaskKind;
          lead_id: string;
          organization_id: string;
          request_id: string;
          status?: LeadTaskStatus;
          title: string;
          updated_at?: string;
        },
        {
          assigned_to?: string | null;
          closed_at?: string | null;
          closed_by?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          due_at?: string;
          id?: string;
          kind?: LeadTaskKind;
          lead_id?: string;
          organization_id?: string;
          request_id?: string;
          status?: LeadTaskStatus;
          title?: string;
          updated_at?: string;
        }
      >;
      leads: Table<
        {
          contact_email: string;
          contact_name: string | null;
          contact_phone: string | null;
          erasure_pending_at: string | null;
          erasure_pending_by: string | null;
          estimation_explanation: Json | null;
          flow_id: string;
          flow_name: string;
          flow_title: string;
          flow_version_id: string;
          id: string;
          organization_id: string;
          price_currency: string | null;
          price_max_minor: number | null;
          price_min_minor: number | null;
          price_presentation: string | null;
          public_id: string;
          score: number | null;
          score_category_key: string | null;
          score_category_label: string | null;
          session_id: string;
          status: LeadStatus;
          submit_mutation_id: string;
          submitted_at: string;
          updated_at: string;
        },
        {
          contact_email: string;
          contact_name?: string | null;
          contact_phone?: string | null;
          erasure_pending_at?: string | null;
          erasure_pending_by?: string | null;
          estimation_explanation?: Json | null;
          flow_id: string;
          flow_name: string;
          flow_title: string;
          flow_version_id: string;
          id?: string;
          organization_id: string;
          price_currency?: string | null;
          price_max_minor?: number | null;
          price_min_minor?: number | null;
          price_presentation?: string | null;
          public_id?: string;
          score?: number | null;
          score_category_key?: string | null;
          score_category_label?: string | null;
          session_id: string;
          status?: LeadStatus;
          submit_mutation_id: string;
          submitted_at?: string;
          updated_at?: string;
        },
        {
          contact_email?: string;
          contact_name?: string | null;
          contact_phone?: string | null;
          erasure_pending_at?: string | null;
          erasure_pending_by?: string | null;
          estimation_explanation?: Json | null;
          flow_id?: string;
          flow_name?: string;
          flow_title?: string;
          flow_version_id?: string;
          id?: string;
          organization_id?: string;
          price_currency?: string | null;
          price_max_minor?: number | null;
          price_min_minor?: number | null;
          price_presentation?: string | null;
          public_id?: string;
          score?: number | null;
          score_category_key?: string | null;
          score_category_label?: string | null;
          session_id?: string;
          status?: LeadStatus;
          submit_mutation_id?: string;
          submitted_at?: string;
          updated_at?: string;
        }
      >;
      flow_invitation_delivery_attempts: Table<
        {
          attempt_number: number;
          error_code: NotificationErrorCode | null;
          finished_at: string | null;
          id: string;
          invitation_id: string;
          organization_id: string;
          outcome: NotificationAttemptOutcome | null;
          provider: "resend" | "test";
          provider_message_id: string | null;
          started_at: string;
        },
        {
          attempt_number: number;
          error_code?: NotificationErrorCode | null;
          finished_at?: string | null;
          id?: string;
          invitation_id: string;
          organization_id: string;
          outcome?: NotificationAttemptOutcome | null;
          provider: "resend" | "test";
          provider_message_id?: string | null;
          started_at?: string;
        },
        {
          attempt_number?: number;
          error_code?: NotificationErrorCode | null;
          finished_at?: string | null;
          id?: string;
          invitation_id?: string;
          organization_id?: string;
          outcome?: NotificationAttemptOutcome | null;
          provider?: "resend" | "test";
          provider_message_id?: string | null;
          started_at?: string;
        }
      >;
      flow_invitations: Table<
        {
          attempt_count: number;
          available_at: string;
          created_at: string;
          created_by: string;
          flow_id: string;
          flow_version_id: string;
          id: string;
          last_error_code: NotificationErrorCode | null;
          locked_at: string | null;
          lock_token: string | null;
          organization_id: string;
          personal_message: string | null;
          provider: "resend" | "test" | null;
          provider_message_id: string | null;
          public_flow_id: string;
          recipient_email: string;
          recipient_name: string | null;
          request_id: string;
          sent_at: string | null;
          status: FlowInvitationStatus;
          template_version: "flow-invitation-v1";
          updated_at: string;
        },
        {
          attempt_count?: number;
          available_at?: string;
          created_at?: string;
          created_by: string;
          flow_id: string;
          flow_version_id: string;
          id?: string;
          last_error_code?: NotificationErrorCode | null;
          locked_at?: string | null;
          lock_token?: string | null;
          organization_id: string;
          personal_message?: string | null;
          provider?: "resend" | "test" | null;
          provider_message_id?: string | null;
          public_flow_id: string;
          recipient_email: string;
          recipient_name?: string | null;
          request_id: string;
          sent_at?: string | null;
          status?: FlowInvitationStatus;
          template_version?: "flow-invitation-v1";
          updated_at?: string;
        },
        {
          attempt_count?: number;
          available_at?: string;
          created_at?: string;
          created_by?: string;
          flow_id?: string;
          flow_version_id?: string;
          id?: string;
          last_error_code?: NotificationErrorCode | null;
          locked_at?: string | null;
          lock_token?: string | null;
          organization_id?: string;
          personal_message?: string | null;
          provider?: "resend" | "test" | null;
          provider_message_id?: string | null;
          public_flow_id?: string;
          recipient_email?: string;
          recipient_name?: string | null;
          request_id?: string;
          sent_at?: string | null;
          status?: FlowInvitationStatus;
          template_version?: "flow-invitation-v1";
          updated_at?: string;
        }
      >;
      notification_delivery_attempts: Table<
        {
          attempt_number: number;
          error_code: NotificationErrorCode | null;
          finished_at: string | null;
          id: string;
          notification_id: string;
          organization_id: string;
          outcome: NotificationAttemptOutcome | null;
          provider: "resend" | "test";
          provider_message_id: string | null;
          started_at: string;
        },
        {
          attempt_number: number;
          error_code?: NotificationErrorCode | null;
          finished_at?: string | null;
          id?: string;
          notification_id: string;
          organization_id: string;
          outcome?: NotificationAttemptOutcome | null;
          provider: "resend" | "test";
          provider_message_id?: string | null;
          started_at?: string;
        },
        {
          attempt_number?: number;
          error_code?: NotificationErrorCode | null;
          finished_at?: string | null;
          id?: string;
          notification_id?: string;
          organization_id?: string;
          outcome?: NotificationAttemptOutcome | null;
          provider?: "resend" | "test";
          provider_message_id?: string | null;
          started_at?: string;
        }
      >;
      notifications: Table<
        {
          attempt_count: number;
          available_at: string;
          created_at: string;
          id: string;
          kind: NotificationKind;
          last_error_code: NotificationErrorCode | null;
          lead_id: string;
          locked_at: string | null;
          lock_token: string | null;
          organization_id: string;
          provider: "resend" | "test" | null;
          provider_message_id: string | null;
          recipient_email: string | null;
          sent_at: string | null;
          status: NotificationStatus;
          template_version: string;
          updated_at: string;
        },
        {
          attempt_count?: number;
          available_at?: string;
          created_at?: string;
          id?: string;
          kind: NotificationKind;
          last_error_code?: NotificationErrorCode | null;
          lead_id: string;
          locked_at?: string | null;
          lock_token?: string | null;
          organization_id: string;
          provider?: "resend" | "test" | null;
          provider_message_id?: string | null;
          recipient_email?: string | null;
          sent_at?: string | null;
          status?: NotificationStatus;
          template_version: string;
          updated_at?: string;
        },
        {
          attempt_count?: number;
          available_at?: string;
          created_at?: string;
          id?: string;
          kind?: NotificationKind;
          last_error_code?: NotificationErrorCode | null;
          lead_id?: string;
          locked_at?: string | null;
          lock_token?: string | null;
          organization_id?: string;
          provider?: "resend" | "test" | null;
          provider_message_id?: string | null;
          recipient_email?: string | null;
          sent_at?: string | null;
          status?: NotificationStatus;
          template_version?: string;
          updated_at?: string;
        }
      >;
      organization_members: Table<
        {
          created_at: string;
          invited_by: string | null;
          joined_at: string | null;
          organization_id: string;
          role: OrganizationMemberRole;
          status: OrganizationMemberStatus;
          updated_at: string;
          user_id: string;
        },
        {
          created_at?: string;
          invited_by?: string | null;
          joined_at?: string | null;
          organization_id: string;
          role: OrganizationMemberRole;
          status?: OrganizationMemberStatus;
          updated_at?: string;
          user_id: string;
        },
        {
          created_at?: string;
          invited_by?: string | null;
          joined_at?: string | null;
          organization_id?: string;
          role?: OrganizationMemberRole;
          status?: OrganizationMemberStatus;
          updated_at?: string;
          user_id?: string;
        }
      >;
      organization_data_policies: Table<
        {
          created_at: string;
          lead_retention_days: number | null;
          organization_id: string;
          retention_approved_at: string | null;
          retention_approved_by: string | null;
          updated_at: string;
        },
        {
          created_at?: string;
          lead_retention_days?: number | null;
          organization_id: string;
          retention_approved_at?: string | null;
          retention_approved_by?: string | null;
          updated_at?: string;
        },
        {
          created_at?: string;
          lead_retention_days?: number | null;
          organization_id?: string;
          retention_approved_at?: string | null;
          retention_approved_by?: string | null;
          updated_at?: string;
        }
      >;
      organizations: Table<
        {
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          id: string;
          name: string;
          slug: string;
          updated_at: string;
        },
        {
          created_at?: string;
          created_by: string;
          deleted_at?: string | null;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string;
        },
        {
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          updated_at?: string;
        }
      >;
      profiles: Table<
        {
          created_at: string;
          display_name: string | null;
          id: string;
          updated_at: string;
        },
        {
          created_at?: string;
          display_name?: string | null;
          id: string;
          updated_at?: string;
        },
        {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          updated_at?: string;
        }
      >;
      published_flows: Table<
        {
          flow_id: string;
          flow_version_id: string;
          organization_id: string;
          public_id: string;
          published_at: string;
        },
        {
          flow_id: string;
          flow_version_id: string;
          organization_id: string;
          public_id?: string;
          published_at?: string;
        },
        {
          flow_id?: string;
          flow_version_id?: string;
          organization_id?: string;
          public_id?: string;
          published_at?: string;
        }
      >;
      session_answers: Table<
        {
          answer: Json;
          answer_revision: number;
          created_at: string;
          id: string;
          organization_id: string;
          session_id: string;
          step_key: string;
          updated_at: string;
        },
        {
          answer: Json;
          answer_revision: number;
          created_at?: string;
          id?: string;
          organization_id: string;
          session_id: string;
          step_key: string;
          updated_at?: string;
        },
        {
          answer?: Json;
          answer_revision?: number;
          created_at?: string;
          id?: string;
          organization_id?: string;
          session_id?: string;
          step_key?: string;
          updated_at?: string;
        }
      >;
      session_events: Table<
        {
          device: AnalyticsDevice;
          expires_at: string;
          flow_id: string;
          flow_version_id: string;
          id: string;
          name: AnalyticsEventName;
          occurred_at: string;
          organization_id: string;
          received_at: string;
          schema_version: number;
          session_id: string;
          source: AnalyticsSource;
          step_key: string | null;
        },
        {
          device: AnalyticsDevice;
          expires_at: string;
          flow_id: string;
          flow_version_id: string;
          id: string;
          name: AnalyticsEventName;
          occurred_at: string;
          organization_id: string;
          received_at?: string;
          schema_version: number;
          session_id: string;
          source: AnalyticsSource;
          step_key?: string | null;
        },
        {
          device?: AnalyticsDevice;
          expires_at?: string;
          flow_id?: string;
          flow_version_id?: string;
          id?: string;
          name?: AnalyticsEventName;
          occurred_at?: string;
          organization_id?: string;
          received_at?: string;
          schema_version?: number;
          session_id?: string;
          source?: AnalyticsSource;
          step_key?: string | null;
        }
      >;
      webhook_delivery_attempts: Table<
        {
          delivery_id: string;
          error_code: WebhookErrorCode | null;
          finished_at: string | null;
          id: string;
          organization_id: string;
          outcome: WebhookAttemptOutcome | null;
          response_status: number | null;
          started_at: string;
          attempt_number: number;
        },
        {
          attempt_number: number;
          delivery_id: string;
          error_code?: WebhookErrorCode | null;
          finished_at?: string | null;
          id?: string;
          organization_id: string;
          outcome?: WebhookAttemptOutcome | null;
          response_status?: number | null;
          started_at?: string;
        },
        {
          attempt_number?: number;
          delivery_id?: string;
          error_code?: WebhookErrorCode | null;
          finished_at?: string | null;
          id?: string;
          organization_id?: string;
          outcome?: WebhookAttemptOutcome | null;
          response_status?: number | null;
          started_at?: string;
        }
      >;
      webhook_deliveries: Table<
        {
          attempt_count: number;
          available_at: string;
          created_at: string;
          delivered_at: string | null;
          endpoint_id: string;
          event_id: string;
          event_type: string;
          id: string;
          is_test: boolean;
          last_error_code: WebhookErrorCode | null;
          lead_id: string | null;
          locked_at: string | null;
          lock_token: string | null;
          occurred_at: string;
          organization_id: string;
          response_status: number | null;
          status: WebhookDeliveryStatus;
          updated_at: string;
        },
        {
          attempt_count?: number;
          available_at?: string;
          created_at?: string;
          delivered_at?: string | null;
          endpoint_id: string;
          event_id?: string;
          event_type?: string;
          id?: string;
          is_test?: boolean;
          last_error_code?: WebhookErrorCode | null;
          lead_id?: string | null;
          locked_at?: string | null;
          lock_token?: string | null;
          occurred_at?: string;
          organization_id: string;
          response_status?: number | null;
          status?: WebhookDeliveryStatus;
          updated_at?: string;
        },
        {
          attempt_count?: number;
          available_at?: string;
          created_at?: string;
          delivered_at?: string | null;
          endpoint_id?: string;
          event_id?: string;
          event_type?: string;
          id?: string;
          is_test?: boolean;
          last_error_code?: WebhookErrorCode | null;
          lead_id?: string | null;
          locked_at?: string | null;
          lock_token?: string | null;
          occurred_at?: string;
          organization_id?: string;
          response_status?: number | null;
          status?: WebhookDeliveryStatus;
          updated_at?: string;
        }
      >;
      webhook_endpoints: Table<
        {
          created_at: string;
          created_by: string;
          disabled_at: string | null;
          disabled_by: string | null;
          event_type: string;
          id: string;
          last_delivered_at: string | null;
          last_rotation_request_id: string | null;
          last_tested_at: string | null;
          organization_id: string;
          request_id: string;
          rotated_at: string | null;
          rotated_by: string | null;
          secret_version: number;
          status: WebhookEndpointStatus;
          updated_at: string;
          url: string;
        },
        {
          created_at?: string;
          created_by: string;
          disabled_at?: string | null;
          disabled_by?: string | null;
          event_type?: string;
          id?: string;
          last_delivered_at?: string | null;
          last_rotation_request_id?: string | null;
          last_tested_at?: string | null;
          organization_id: string;
          request_id: string;
          rotated_at?: string | null;
          rotated_by?: string | null;
          secret_version?: number;
          status?: WebhookEndpointStatus;
          updated_at?: string;
          url: string;
        },
        {
          created_at?: string;
          created_by?: string;
          disabled_at?: string | null;
          disabled_by?: string | null;
          event_type?: string;
          id?: string;
          last_delivered_at?: string | null;
          last_rotation_request_id?: string | null;
          last_tested_at?: string | null;
          organization_id?: string;
          request_id?: string;
          rotated_at?: string | null;
          rotated_by?: string | null;
          secret_version?: number;
          status?: WebhookEndpointStatus;
          updated_at?: string;
          url?: string;
        }
      >;
      widget_session_mutations: Table<
        {
          created_at: string;
          mutation_id: string;
          resulting_revision: number;
          resulting_step_key: string | null;
          session_id: string;
        },
        {
          created_at?: string;
          mutation_id: string;
          resulting_revision: number;
          resulting_step_key?: string | null;
          session_id: string;
        },
        {
          created_at?: string;
          mutation_id?: string;
          resulting_revision?: number;
          resulting_step_key?: string | null;
          session_id?: string;
        }
      >;
      widget_sessions: Table<
        {
          created_at: string;
          current_step_key: string | null;
          expires_at: string;
          flow_id: string;
          flow_version_id: string;
          id: string;
          last_seen_at: string;
          organization_id: string;
          public_flow_id: string;
          revision: number;
          status: WidgetSessionStatus;
          step_history: string[];
          token_hash: string;
        },
        {
          created_at?: string;
          current_step_key?: string | null;
          expires_at?: string;
          flow_id: string;
          flow_version_id: string;
          id?: string;
          last_seen_at?: string;
          organization_id: string;
          public_flow_id: string;
          revision?: number;
          status?: WidgetSessionStatus;
          step_history?: string[];
          token_hash: string;
        },
        {
          created_at?: string;
          current_step_key?: string | null;
          expires_at?: string;
          flow_id?: string;
          flow_version_id?: string;
          id?: string;
          last_seen_at?: string;
          organization_id?: string;
          public_flow_id?: string;
          revision?: number;
          status?: WidgetSessionStatus;
          step_history?: string[];
          token_hash?: string;
        }
      >;
      wordpress_connections: Table<
        {
          connected_at: string;
          credential_hash: string;
          id: string;
          last_seen_at: string;
          organization_id: string;
          php_version: string;
          plugin_version: string;
          revoked_at: string | null;
          site_origin: string;
          wordpress_version: string;
        },
        {
          connected_at?: string;
          credential_hash: string;
          id?: string;
          last_seen_at?: string;
          organization_id: string;
          php_version: string;
          plugin_version: string;
          revoked_at?: string | null;
          site_origin: string;
          wordpress_version: string;
        },
        {
          connected_at?: string;
          credential_hash?: string;
          id?: string;
          last_seen_at?: string;
          organization_id?: string;
          php_version?: string;
          plugin_version?: string;
          revoked_at?: string | null;
          site_origin?: string;
          wordpress_version?: string;
        }
      >;
      wordpress_install_tokens: Table<
        {
          created_at: string;
          created_by: string;
          expires_at: string;
          id: string;
          organization_id: string;
          site_origin: string;
          token_hash: string;
          used_at: string | null;
        },
        {
          created_at?: string;
          created_by: string;
          expires_at?: string;
          id?: string;
          organization_id: string;
          site_origin: string;
          token_hash: string;
          used_at?: string | null;
        },
        {
          created_at?: string;
          created_by?: string;
          expires_at?: string;
          id?: string;
          organization_id?: string;
          site_origin?: string;
          token_hash?: string;
          used_at?: string | null;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      archive_flow_version: {
        Args: { target_version_id: string };
        Returns: Json;
      };
      calculate_widget_result: {
        Args: { session_token: string };
        Returns: Json;
      };
      create_organization: {
        Args: { organization_name: string; organization_slug: string };
        Returns: Array<{ id: string; name: string; slug: string }>;
      };
      create_webhook_endpoint: {
        Args: { idempotency_key: string; target_organization_id: string; target_url: string };
        Returns: Json;
      };
      create_wordpress_install_token: {
        Args: { target_organization_id: string; target_site_origin: string };
        Returns: Json;
      };
      change_lead_status: {
        Args: {
          target_lead_id: string;
          target_organization_id: string;
          target_status: LeadStatus;
        };
        Returns: undefined;
      };
      close_lead_task: {
        Args: {
          target_organization_id: string;
          target_status: LeadTaskStatus;
          target_task_id: string;
        };
        Returns: undefined;
      };
      claim_notification_batch: {
        Args: {
          batch_size: number;
          delivery_provider: "resend" | "test";
          worker_id: string;
        };
        Returns: Array<{
          attempt_number: number;
          company_name: string;
          contact_email: string;
          contact_name: string | null;
          flow_title: string;
          kind: NotificationKind;
          lead_id: string;
          lock_token: string;
          notification_id: string;
          organization_id: string;
          price_currency: string | null;
          price_max_minor: number | null;
          price_min_minor: number | null;
          price_presentation: string | null;
          recipient_email: string;
          score: number | null;
          submitted_at: string;
          template_version: string;
        }>;
      };
      claim_webhook_delivery_batch: {
        Args: { batch_size: number; worker_id: string };
        Returns: Array<{
          attempt_number: number;
          contact_email: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          delivery_id: string;
          endpoint_id: string;
          endpoint_url: string;
          event_id: string;
          event_type: string;
          flow_title: string | null;
          is_test: boolean;
          lead_public_id: string | null;
          lock_token: string;
          occurred_at: string;
          organization_id: string;
          price_currency: string | null;
          price_max_minor: number | null;
          price_min_minor: number | null;
          price_presentation: string | null;
          secret_version: number;
          submitted_at: string | null;
        }>;
      };
      claim_flow_invitation_batch: {
        Args: {
          batch_size: number;
          delivery_provider: "resend" | "test";
          worker_id: string;
        };
        Returns: Array<{
          attempt_number: number;
          company_name: string;
          flow_id: string;
          flow_title: string;
          invitation_id: string;
          lock_token: string;
          organization_id: string;
          personal_message: string | null;
          public_flow_id: string;
          recipient_email: string;
          recipient_name: string | null;
          template_version: string;
        }>;
      };
      complete_flow_invitation_delivery: {
        Args: {
          delivery_provider: "resend" | "test";
          target_invitation_id: string;
          target_lock_token: string;
          target_provider_message_id: string;
        };
        Returns: undefined;
      };
      complete_notification_delivery: {
        Args: {
          delivery_provider: "resend" | "test";
          target_lock_token: string;
          target_notification_id: string;
          target_provider_message_id: string;
        };
        Returns: undefined;
      };
      complete_webhook_delivery: {
        Args: {
          target_delivery_id: string;
          target_lock_token: string;
          target_response_status: number;
        };
        Returns: undefined;
      };
      create_flow_invitation: {
        Args: {
          idempotency_key: string;
          target_flow_id: string;
          target_organization_id: string;
          target_personal_message?: string | null;
          target_recipient_email: string;
          target_recipient_name?: string | null;
        };
        Returns: Json;
      };
      create_lead_task: {
        Args: {
          idempotency_key: string;
          target_assignee_user_id: string | null;
          target_description: string | null;
          target_due_at: string;
          target_kind: LeadTaskKind;
          target_lead_id: string;
          target_organization_id: string;
          target_title: string;
        };
        Returns: Json;
      };
      create_widget_session: {
        Args: { target_public_id: string };
        Returns: Json;
      };
      disconnect_wordpress: {
        Args: { connector_credential: string };
        Returns: boolean;
      };
      disable_webhook_endpoint: {
        Args: { target_endpoint_id: string; target_organization_id: string };
        Returns: boolean;
      };
      enqueue_webhook_test: {
        Args: {
          request_id: string;
          target_endpoint_id: string;
          target_organization_id: string;
        };
        Returns: Json;
      };
      exchange_wordpress_install_token: {
        Args: {
          install_token: string;
          target_php_version: string;
          target_plugin_version: string;
          target_site_origin: string;
          target_wordpress_version: string;
        };
        Returns: Json;
      };
      erase_lead_personal_data: {
        Args: { target_lead_id: string; target_organization_id: string };
        Returns: Json;
      };
      export_lead_personal_data: {
        Args: { target_lead_id: string; target_organization_id: string };
        Returns: Json;
      };
      get_expired_session_candidates: {
        Args: { batch_size?: number };
        Returns: Array<{ object_paths: string[]; session_id: string }>;
      };
      get_lead_erasure_storage_paths: {
        Args: { target_lead_id: string; target_organization_id: string };
        Returns: string[];
      };
      get_retention_candidates: {
        Args: { batch_size?: number };
        Returns: Array<{ lead_id: string; object_paths: string[]; organization_id: string }>;
      };
      get_wordpress_diagnostics: {
        Args: { connector_credential: string };
        Returns: Json;
      };
      get_wordpress_flows: {
        Args: { connector_credential: string };
        Returns: Json;
      };
      get_widget_manifest: {
        Args: { target_public_id: string };
        Returns: Json;
      };
      get_analytics_overview: {
        Args: {
          period_end: string;
          period_start: string;
          target_organization_id: string;
        };
        Returns: Json;
      };
      fail_notification_delivery: {
        Args: {
          delivery_provider: "resend" | "test";
          retryable: boolean;
          target_error_code: NotificationErrorCode;
          target_lock_token: string;
          target_notification_id: string;
        };
        Returns: undefined;
      };
      fail_webhook_delivery: {
        Args: {
          retryable: boolean;
          target_delivery_id: string;
          target_error_code: WebhookErrorCode;
          target_lock_token: string;
          target_response_status?: number | null;
        };
        Returns: undefined;
      };
      fail_flow_invitation_delivery: {
        Args: {
          delivery_provider: "resend" | "test";
          retryable: boolean;
          target_error_code: NotificationErrorCode;
          target_invitation_id: string;
          target_lock_token: string;
        };
        Returns: undefined;
      };
      publish_flow: {
        Args: {
          expected_draft_revision: number;
          target_flow_id: string;
        };
        Returns: Json;
      };
      purge_expired_analytics: {
        Args: { batch_size?: number };
        Returns: number;
      };
      purge_expired_sessions: {
        Args: { target_session_ids: string[] };
        Returns: number;
      };
      purge_retention_candidates: {
        Args: { target_lead_ids: string[] };
        Returns: number;
      };
      record_analytics_consent: {
        Args: {
          consent_version: string;
          granted: boolean;
          mutation_id: string;
          session_token: string;
        };
        Returns: Json;
      };
      record_widget_event: {
        Args: {
          event_device: AnalyticsDevice;
          event_id: string;
          event_name: AnalyticsEventName;
          event_occurred_at: string;
          event_schema_version: number;
          event_source: AnalyticsSource;
          event_step_key: string | null;
          session_token: string;
        };
        Returns: Json;
      };
      runtime_readiness_probe: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      resume_widget_session: {
        Args: { session_token: string };
        Returns: Json;
      };
      rotate_webhook_endpoint_secret: {
        Args: {
          idempotency_key: string;
          target_endpoint_id: string;
          target_organization_id: string;
        };
        Returns: Json;
      };
      revoke_wordpress_connection: {
        Args: { target_connection_id: string; target_organization_id: string };
        Returns: boolean;
      };
      release_lead_legal_hold: {
        Args: { target_lead_id: string; target_organization_id: string };
        Returns: undefined;
      };
      set_lead_legal_hold: {
        Args: { target_lead_id: string; target_organization_id: string; target_reason: string };
        Returns: undefined;
      };
      set_lead_assignee: {
        Args: {
          target_assignee_user_id: string | null;
          target_lead_id: string;
          target_organization_id: string;
        };
        Returns: undefined;
      };
      set_lead_priority: {
        Args: {
          target_lead_id: string;
          target_organization_id: string;
          target_priority: LeadPriority;
        };
        Returns: undefined;
      };
      set_organization_retention: {
        Args: {
          target_lead_retention_days: number | null;
          target_organization_id: string;
        };
        Returns: Json;
      };
      complete_widget_file: {
        Args: { session_token: string; target_file_id: string };
        Returns: Json;
      };
      reject_widget_file: {
        Args: { session_token: string; target_file_id: string };
        Returns: undefined;
      };
      reserve_widget_file: {
        Args: {
          file_extension: string;
          file_sha256: string;
          mime_type: string;
          original_name: string;
          session_token: string;
          size_bytes: number;
        };
        Returns: Json;
      };
      save_widget_answer: {
        Args: {
          answer: Json;
          expected_revision: number;
          mutation_id: string;
          next_step_key: string | null;
          session_token: string;
          target_step_key: string;
        };
        Returns: Json;
      };
      submit_widget_lead: {
        Args: {
          contact: Json;
          file_ids: string[];
          marketing_email_consent: Json | null;
          mutation_id: string;
          privacy_notice: Json;
          session_token: string;
        };
        Returns: Json;
      };
      validate_flow: {
        Args: { target_flow_id: string };
        Returns: Json;
      };
    };
    Enums: {
      analytics_consent_state: AnalyticsConsentState;
      analytics_device: AnalyticsDevice;
      analytics_event_name: AnalyticsEventName;
      analytics_source: AnalyticsSource;
      flow_version_status: FlowVersionStatus;
      flow_invitation_status: FlowInvitationStatus;
      consent_record_type: ConsentRecordType;
      lead_file_status: LeadFileStatus;
      lead_activity_kind: LeadActivityKind;
      lead_priority: LeadPriority;
      lead_status: LeadStatus;
      lead_task_kind: LeadTaskKind;
      lead_task_status: LeadTaskStatus;
      notification_attempt_outcome: NotificationAttemptOutcome;
      notification_error_code: NotificationErrorCode;
      notification_kind: NotificationKind;
      notification_status: NotificationStatus;
      organization_member_role: OrganizationMemberRole;
      organization_member_status: OrganizationMemberStatus;
      webhook_attempt_outcome: WebhookAttemptOutcome;
      webhook_delivery_status: WebhookDeliveryStatus;
      webhook_endpoint_status: WebhookEndpointStatus;
      webhook_error_code: WebhookErrorCode;
      widget_session_status: WidgetSessionStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
