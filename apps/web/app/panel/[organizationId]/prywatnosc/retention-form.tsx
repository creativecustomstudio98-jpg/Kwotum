"use client";

import { Button, FieldMessage, FormField, Input, Switch } from "@wyceno/ui";
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
      <Switch
        defaultChecked={retentionDays !== null}
        description="Usuwaj leady po upływie zatwierdzonego okresu."
        label="Automatyczne usuwanie"
        name="enabled"
      />
      <FormField
        hint="Dozwolony zakres: 30–3650 dni."
        id="retention-days"
        label="Okres retencji w dniach"
      >
        <Input
          defaultValue={retentionDays ?? 365}
          id="retention-days"
          max={3650}
          min={30}
          name="retentionDays"
          required
          type="number"
        />
      </FormField>
      <Button loading={pending} loadingLabel="Zapisuję…" type="submit">
        Zapisz politykę
      </Button>
      {state.error ? <FieldMessage tone="error">{state.error}</FieldMessage> : null}
      {state.success ? <FieldMessage tone="success">{state.success}</FieldMessage> : null}
    </form>
  );
}
