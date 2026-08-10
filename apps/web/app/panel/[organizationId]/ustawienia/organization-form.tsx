"use client";

import { Button, Input } from "@wyceno/ui";
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
    <form action={action} className="organization-settings-form">
      <input name="organizationId" type="hidden" value={organizationId} />
      <label className="settings-field" htmlFor="organization-name">
        <span>Nazwa organizacji</span>
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
        <small>Ta nazwa jest widoczna w panelu i tenantowych komunikatach.</small>
      </label>
      <label className="settings-field" htmlFor="organization-slug">
        <span>Identyfikator obszaru</span>
        <Input disabled id="organization-slug" readOnly value={slug} />
        <small>Stabilny identyfikator techniczny nie zmienia się razem z nazwą.</small>
      </label>
      <label className="settings-field" htmlFor="organization-owner-email">
        <span>Aktualne konto</span>
        <Input
          disabled
          id="organization-owner-email"
          readOnly
          value={currentUserEmail ?? "Adres niedostępny"}
        />
      </label>
      <label className="settings-field" htmlFor="organization-role">
        <span>Rola w organizacji</span>
        <Input disabled id="organization-role" readOnly value={roleLabel(role)} />
      </label>
      <div className="organization-settings-form__actions">
        <Button disabled={!editable || pending} type="submit">
          {pending ? "Zapisuję…" : "Zapisz zmiany"}
        </Button>
        {!editable ? (
          <p className="settings-form-status">Zmianę nazwy może zapisać właściciel.</p>
        ) : null}
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

function roleLabel(role: "admin" | "owner" | "sales"): string {
  if (role === "owner") return "Właściciel";
  if (role === "admin") return "Administrator";
  return "Sprzedaż";
}
