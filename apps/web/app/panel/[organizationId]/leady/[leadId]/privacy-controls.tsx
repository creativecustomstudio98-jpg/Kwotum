"use client";

import { Button, Input, Textarea } from "@wyceno/ui";
import { useActionState } from "react";

import {
  eraseLeadAction,
  releaseLegalHoldAction,
  setLegalHoldAction,
  type LeadPrivacyActionState,
} from "./privacy-actions";

const initialState = { error: null, success: null } satisfies LeadPrivacyActionState;

function Result({ state }: { state: LeadPrivacyActionState }) {
  if (state.error) {
    return (
      <p className="lead-action-error" role="alert">
        {state.error}
      </p>
    );
  }
  return state.success ? (
    <p className="lead-action-success" role="status">
      {state.success}
    </p>
  ) : null;
}

function Identifiers({ leadId, organizationId }: { leadId: string; organizationId: string }) {
  return (
    <>
      <input name="leadId" type="hidden" value={leadId} />
      <input name="organizationId" type="hidden" value={organizationId} />
    </>
  );
}

export function LeadPrivacyControls({
  hold,
  leadId,
  organizationId,
}: {
  hold: { createdAt: string; reason: string } | null;
  leadId: string;
  organizationId: string;
}) {
  const [holdState, holdAction, holdPending] = useActionState(setLegalHoldAction, initialState);
  const [releaseState, releaseAction, releasePending] = useActionState(
    releaseLegalHoldAction,
    initialState,
  );
  const [eraseState, eraseAction, erasePending] = useActionState(eraseLeadAction, initialState);

  return (
    <div className="lead-action-form">
      <a
        className="wy-button wy-button--secondary wy-button--small"
        href={`/api/v1/organizations/${organizationId}/leads/${leadId}/export`}
      >
        Eksportuj dane JSON
      </a>

      {hold ? (
        <form action={releaseAction} className="lead-action-form">
          <Identifiers leadId={leadId} organizationId={organizationId} />
          <p>
            <strong>Aktywna blokada prawna:</strong> {hold.reason}
          </p>
          <Button disabled={releasePending} type="submit" variant="secondary">
            Zwolnij blokadę
          </Button>
          <Result state={releaseState} />
        </form>
      ) : (
        <form action={holdAction} className="lead-action-form">
          <Identifiers leadId={leadId} organizationId={organizationId} />
          <label htmlFor="legal-hold-reason">Powód blokady prawnej</label>
          <Textarea
            id="legal-hold-reason"
            maxLength={500}
            minLength={5}
            name="reason"
            required
            rows={3}
          />
          <Button disabled={holdPending} type="submit" variant="secondary">
            Ustaw blokadę
          </Button>
          <Result state={holdState} />
        </form>
      )}

      <form action={eraseAction} className="lead-action-form">
        <Identifiers leadId={leadId} organizationId={organizationId} />
        <label htmlFor="erase-confirmation">
          Trwale usuń dane i pliki: wpisz <strong>USUŃ</strong>
        </label>
        <Input autoComplete="off" id="erase-confirmation" name="confirmation" required />
        <Button disabled={erasePending || hold !== null} type="submit" variant="danger">
          Usuń dane leada
        </Button>
        <Result state={eraseState} />
      </form>
    </div>
  );
}
