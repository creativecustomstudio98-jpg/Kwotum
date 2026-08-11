"use client";

import { Button, Input } from "@wyceno/ui";
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
      <label className="settings-field" htmlFor="lead-alert-email">
        <span>Adres odbiorczy nowych leadów</span>
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
        <small>
          Możesz użyć adresu z przekierowaniem. Odbiorca wiadomości nie musi mieć konta w panelu.
        </small>
      </label>
      <div className="organization-settings-form__actions">
        <Button disabled={pending} type="submit">
          {pending ? "Zapisuję…" : "Zapisz adres"}
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
      </div>
    </form>
  );
}
