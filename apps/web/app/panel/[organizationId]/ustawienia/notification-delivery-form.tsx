"use client";

import { Button, FieldMessage, FormField, Input } from "@wyceno/ui";
import { useActionState } from "react";

import { updateLeadAlertEmailAction, type OrganizationSettingsActionState } from "./actions";

const initialState = {
  error: null,
  success: null,
} satisfies OrganizationSettingsActionState;

export function NotificationDeliveryForm({
  leadAlertEmail,
  organizationId,
}: Readonly<{ leadAlertEmail: string | null; organizationId: string }>) {
  const [state, action, pending] = useActionState(updateLeadAlertEmailAction, initialState);

  return (
    <form action={action} className="organization-settings-form">
      <input name="organizationId" type="hidden" value={organizationId} />
      <FormField
        hint="Możesz użyć adresu z przekierowaniem. Odbiorca wiadomości nie musi mieć konta w panelu."
        id="lead-alert-email"
        label="Adres odbiorczy nowych leadów"
      >
        <Input
          autoComplete="email"
          defaultValue={leadAlertEmail ?? ""}
          id="lead-alert-email"
          inputMode="email"
          maxLength={254}
          name="leadAlertEmail"
          placeholder="kontakt@firma.pl"
          required
          type="email"
        />
      </FormField>
      <div className="organization-settings-form__actions">
        <Button loading={pending} loadingLabel="Zapisuję…" type="submit">
          Zapisz adres
        </Button>
        {state.error ? <FieldMessage tone="error">{state.error}</FieldMessage> : null}
        {state.success ? <FieldMessage tone="success">{state.success}</FieldMessage> : null}
      </div>
    </form>
  );
}
