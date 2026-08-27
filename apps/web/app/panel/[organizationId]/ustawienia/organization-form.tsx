"use client";

import { Button, FieldMessage, FormField, Input } from "@wyceno/ui";
import { useActionState } from "react";

import { updateOrganizationAction, type OrganizationSettingsActionState } from "./actions";

const initialState = {
  error: null,
  success: null,
} satisfies OrganizationSettingsActionState;

export function OrganizationForm({
  currentUserEmail,
  editable,
  name,
  organizationId,
  role,
  slug,
}: Readonly<{
  currentUserEmail: string | null;
  editable: boolean;
  name: string;
  organizationId: string;
  role: "admin" | "owner" | "sales";
  slug: string;
}>) {
  const [state, action, pending] = useActionState(updateOrganizationAction, initialState);

  return (
    <form action={action} className="settings-form settings-organization-form">
      <input name="organizationId" type="hidden" value={organizationId} />
      <FormField
        hint="Ta nazwa jest widoczna w panelu i tenantowych komunikatach."
        id="organization-name"
        label="Nazwa organizacji"
      >
        <Input
          defaultValue={name}
          disabled={!editable}
          id="organization-name"
          maxLength={120}
          minLength={2}
          name="name"
          readOnly={!editable}
          required
        />
      </FormField>
      <FormField
        hint="Stabilny identyfikator techniczny nie zmienia się razem z nazwą."
        id="organization-slug"
        label="Identyfikator obszaru"
      >
        <Input disabled id="organization-slug" readOnly value={slug} />
      </FormField>
      <FormField id="organization-owner-email" label="Aktualne konto">
        <Input
          disabled
          id="organization-owner-email"
          readOnly
          value={currentUserEmail ?? "Adres niedostępny"}
        />
      </FormField>
      <FormField id="organization-role" label="Rola w organizacji">
        <Input disabled id="organization-role" readOnly value={roleLabel(role)} />
      </FormField>
      <div className="settings-form__actions">
        <Button disabled={!editable} loading={pending} loadingLabel="Zapisuję…" type="submit">
          Zapisz zmiany
        </Button>
        {!editable ? <FieldMessage>Zmianę nazwy może zapisać właściciel.</FieldMessage> : null}
        {state.error ? <FieldMessage tone="error">{state.error}</FieldMessage> : null}
        {state.success ? <FieldMessage tone="success">{state.success}</FieldMessage> : null}
      </div>
    </form>
  );
}

function roleLabel(role: "admin" | "owner" | "sales"): string {
  if (role === "owner") return "Właściciel";
  if (role === "admin") return "Administrator";
  return "Sprzedaż";
}
