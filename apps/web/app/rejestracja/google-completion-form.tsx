"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthAlert, AuthTextField } from "../auth/auth-fields";
import { AuthIcon } from "../auth/auth-icons";
import { completeGoogleRegistration, type OrganizationCompletionState } from "./actions";

const initialState: OrganizationCompletionState = {};

export function GoogleCompletionForm() {
  const [state, action, pending] = useActionState(completeGoogleRegistration, initialState);
  return (
    <>
      <header className="auth-form-header">
        <h1 id="register-title">Dokończ konfigurację firmy</h1>
        <p>Konto Google jest połączone. Podaj nazwę pierwszej organizacji.</p>
      </header>
      <form action={action} className="auth-form" noValidate>
        <AuthTextField
          autoComplete="organization"
          error={state.fieldErrors?.companyName}
          icon="people"
          label="Nazwa firmy"
          name="companyName"
          placeholder="Nazwa Twojej firmy"
          required
        />
        <label className="auth-checkbox">
          <input name="terms" required type="checkbox" />
          <span>
            Akceptuję <Link href="/regulamin">Regulamin</Link> i{" "}
            <Link href="/polityka-prywatnosci">Politykę prywatności</Link>.
          </span>
        </label>
        {state.fieldErrors?.termsAccepted ? (
          <p className="auth-field__error">
            <span aria-hidden="true">!</span>
            {state.fieldErrors.termsAccepted}
          </p>
        ) : null}
        {state.error ? <AuthAlert>{state.error}</AuthAlert> : null}
        <button
          aria-busy={pending || undefined}
          className="auth-primary"
          disabled={pending}
          type="submit"
        >
          {pending ? <span aria-hidden="true" className="wy-spinner" /> : null}
          <span>{pending ? "Tworzenie organizacji…" : "Przejdź do Kwotum"}</span>
          <AuthIcon name="arrow" />
        </button>
      </form>
    </>
  );
}
