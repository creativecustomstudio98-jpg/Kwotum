"use client";

import { Button, FieldMessage, FormField, Input } from "@wyceno/ui";
import { useActionState } from "react";

import { PanelIcon } from "../../panel-icon";
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
    <form action={action} className="settings-form settings-delivery-form">
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
      <div className="settings-delivery-channel" aria-label="Kanał dostawy leadów">
        <span className="settings-delivery-channel__icon">
          <PanelIcon height={18} name="email" width={18} />
        </span>
        <span>
          <strong>Email</strong>
          <small>Powiadomienie po utworzeniu nowego leada</small>
        </span>
        <span
          className={`panel-status ${
            leadAlertEmail ? "panel-status--qualified" : "panel-status--neutral"
          }`}
        >
          {leadAlertEmail ? "Aktywny" : "Do konfiguracji"}
        </span>
      </div>
      <div className="settings-form__actions">
        <Button loading={pending} loadingLabel="Zapisuję…" type="submit">
          Zapisz adres
        </Button>
        {state.error ? <FieldMessage tone="error">{state.error}</FieldMessage> : null}
        {state.success ? <FieldMessage tone="success">{state.success}</FieldMessage> : null}
      </div>
    </form>
  );
}
