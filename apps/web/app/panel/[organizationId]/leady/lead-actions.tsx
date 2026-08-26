"use client";

import { Button, Select, Textarea } from "@wyceno/ui";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

import { leadStatusLabels, leadStatuses } from "../../../../lib/leads/presentation";
import { addLeadNoteAction, changeLeadStatusAction, type LeadActionState } from "./actions";

const initialState: LeadActionState = { error: null, success: null };
type CreatedNote = NonNullable<LeadActionState["createdNote"]>;

export function LeadStatusForm({
  currentStatus,
  leadId,
  organizationId,
}: {
  currentStatus: (typeof leadStatuses)[number];
  leadId: string;
  organizationId: string;
}) {
  const [state, action, pending] = useActionState(changeLeadStatusAction, initialState);
  useRefreshAfterSuccess(state);
  return (
    <form action={action} className="lead-action-form" id="lead-status-form">
      <input name="organizationId" type="hidden" value={organizationId} />
      <input name="leadId" type="hidden" value={leadId} />
      <label htmlFor="lead-status">Status leada</label>
      <div className="lead-action-row">
        <Select defaultValue={currentStatus} id="lead-status" name="status">
          {leadStatuses.map((status) => (
            <option key={status} value={status}>
              {leadStatusLabels[status]}
            </option>
          ))}
        </Select>
        <Button disabled={pending} type="submit">
          Zapisz status
        </Button>
      </div>
      <ActionMessage state={state} />
    </form>
  );
}

export function LeadStatusSelect({
  currentStatus,
  leadId,
  organizationId,
}: {
  currentStatus: (typeof leadStatuses)[number];
  leadId: string;
  organizationId: string;
}) {
  const [state, action, pending] = useActionState(changeLeadStatusAction, initialState);
  useRefreshAfterSuccess(state);
  return (
    <form action={action} className="lead-reference-status-form">
      <input name="organizationId" type="hidden" value={organizationId} />
      <input name="leadId" type="hidden" value={leadId} />
      <label className="wy-sr-only" htmlFor="lead-reference-status">
        Status leada
      </label>
      <Select
        defaultValue={currentStatus}
        disabled={pending}
        id="lead-reference-status"
        name="status"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        {leadStatuses.map((status) => (
          <option key={status} value={status}>
            {leadStatusLabels[status]}
          </option>
        ))}
      </Select>
      <button className="wy-sr-only" disabled={pending} type="submit">
        Zapisz status
      </button>
      <ActionMessage state={state} />
    </form>
  );
}

export function LeadStartForm({
  leadId,
  organizationId,
}: {
  leadId: string;
  organizationId: string;
}) {
  const [state, action, pending] = useActionState(changeLeadStatusAction, initialState);
  useRefreshAfterSuccess(state);
  return (
    <form action={action} className="lead-reference-start-form">
      <input name="organizationId" type="hidden" value={organizationId} />
      <input name="leadId" type="hidden" value={leadId} />
      <input name="status" type="hidden" value="in_progress" />
      <Button disabled={pending} type="submit">
        Rozpocznij obsługę
      </Button>
      <ActionMessage state={state} />
    </form>
  );
}

export function LeadNoteForm({
  compact = false,
  leadId,
  onCreated,
  organizationId,
}: {
  compact?: boolean;
  leadId: string;
  onCreated?: (note: CreatedNote) => void;
  organizationId: string;
}) {
  const [state, action, pending] = useActionState(addLeadNoteAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const handledNoteIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!state.success || !state.createdNote || handledNoteIdRef.current === state.createdNote.id) {
      return;
    }
    handledNoteIdRef.current = state.createdNote.id;
    formRef.current?.reset();
    onCreated?.(state.createdNote);
  }, [onCreated, state]);
  return (
    <form
      action={action}
      className={`lead-action-form${compact ? " lead-action-form--reference-note" : ""}`}
      ref={formRef}
    >
      <input name="organizationId" type="hidden" value={organizationId} />
      <input name="leadId" type="hidden" value={leadId} />
      <div className={compact ? "wy-sr-only" : "lead-action-form__label"}>
        <label htmlFor="lead-note">Nowa notatka</label>
        <span>Maksymalnie 4000 znaków</span>
      </div>
      <Textarea
        id="lead-note"
        maxLength={4000}
        name="body"
        placeholder={compact ? "Dodaj notatkę…" : "Dodaj kontekst dla zespołu…"}
        required
        rows={compact ? 5 : 4}
      />
      <Button disabled={pending} type="submit">
        {compact ? "Zapisz notatkę" : "Dodaj notatkę"}
      </Button>
      <ActionMessage state={state} />
    </form>
  );
}

function ActionMessage({ state }: { state: LeadActionState }) {
  if (!state.error && !state.success) return null;
  return (
    <p className={state.error ? "lead-action-error" : "lead-action-success"} role="status">
      {state.error ?? state.success}
    </p>
  );
}

function useRefreshAfterSuccess(state: LeadActionState): void {
  const router = useRouter();
  useEffect(() => {
    if (!state.success) return;
    const refreshTimeout = window.setTimeout(() => router.refresh(), 250);
    return () => window.clearTimeout(refreshTimeout);
  }, [router, state]);
}
