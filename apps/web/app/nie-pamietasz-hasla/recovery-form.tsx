"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthAlert, AuthTextField } from "../auth/auth-fields";
import { AuthIcon } from "../auth/auth-icons";
import { requestPasswordReset, type RecoveryState } from "./actions";

const initialState: RecoveryState = {};

export function RecoveryForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialState);

  if (state.status === "sent") {
    return (
      <div className="auth-status">
        <span className="auth-status__symbol">
          <AuthIcon name="email" />
        </span>
        <h1 id="recovery-title">Sprawdź skrzynkę e-mail</h1>
        <p>
          Jeśli konto istnieje, wysłaliśmy instrukcję zmiany hasła na <strong>{state.email}</strong>
          .
        </p>
        <div className="auth-status__actions">
          <Link className="auth-primary" href="/logowanie">
            <span>Wróć do logowania</span>
            <AuthIcon name="arrow" />
          </Link>
          <button
            className="auth-google-button"
            onClick={() => window.location.reload()}
            type="button"
          >
            Wprowadź adres ponownie
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="auth-form-header">
        <h1 id="recovery-title">Nie pamiętasz hasła?</h1>
        <p>Podaj adres e-mail. Wyślemy bezpieczny link do ustawienia nowego hasła.</p>
      </header>
      <form action={action} className="auth-form" noValidate>
        <AuthTextField
          autoComplete="email"
          error={state.fieldErrors?.email}
          icon="email"
          inputMode="email"
          label="Adres e-mail"
          name="email"
          placeholder="jan.kowalski@firma.pl"
          required
          type="email"
        />
        {state.error ? <AuthAlert>{state.error}</AuthAlert> : null}
        <button
          aria-busy={pending || undefined}
          className="auth-primary"
          disabled={pending}
          type="submit"
        >
          {pending ? <span aria-hidden="true" className="wy-spinner" /> : null}
          <span>{pending ? "Wysyłanie…" : "Wyślij link resetujący"}</span>
          <AuthIcon name="arrow" />
        </button>
      </form>
      <p className="auth-switch">
        <Link href="/logowanie">Wróć do logowania</Link>
      </p>
    </>
  );
}
