"use client";

import { Button, Input } from "@wyceno/ui";
import { useActionState } from "react";

import { setRetentionAction, type PrivacyActionState } from "./actions";

const initialState = { error: null, success: null } satisfies PrivacyActionState;

export function RetentionForm({
  organizationId,
  retentionDays,
}: {
  organizationId: string;
  retentionDays: number | null;
}) {
  const [state, action, pending] = useActionState(setRetentionAction, initialState);
  return (
    <form action={action} className="retention-form">
      <input name="organizationId" type="hidden" value={organizationId} />
      <label className="settings-switch">
        <span>
          <strong>Automatyczne usuwanie</strong>
          <small>Usuwaj leady po upływie zatwierdzonego okresu.</small>
        </span>
        <input defaultChecked={retentionDays !== null} name="enabled" type="checkbox" />
      </label>
      <label className="settings-field" htmlFor="retention-days">
        <span>Okres retencji w dniach</span>
        <Input
          defaultValue={retentionDays ?? 365}
          id="retention-days"
          max={3650}
          min={30}
          name="retentionDays"
          required
          type="number"
        />
        <small>Dozwolony zakres: 30–3650 dni.</small>
      </label>
      <Button disabled={pending} type="submit">
        {pending ? "Zapisuję…" : "Zapisz politykę"}
      </Button>
      {state.error ? (
        <p className="lead-action-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="lead-action-success" role="status">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
