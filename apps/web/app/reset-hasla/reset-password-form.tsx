"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthAlert, AuthPasswordField } from "../auth/auth-fields";
import { AuthIcon } from "../auth/auth-icons";
import { resetPassword, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, initialState);

  if (state.status === "success") {
    return (
      <div className="auth-status">
        <span className="auth-status__symbol">
          <AuthIcon name="check" />
        </span>
        <h1 id="reset-title">Hasło zostało zmienione</h1>
        <p>Możesz bezpiecznie zalogować się do Kwotum nowym hasłem.</p>
        <div className="auth-status__actions">
          <Link className="auth-primary" href="/logowanie">
            <span>Zaloguj się</span>
            <AuthIcon name="arrow" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="auth-form-header">
        <h1 id="reset-title">Ustaw nowe hasło</h1>
        <p>Hasło musi mieć co najmniej 8 znaków, literę i cyfrę.</p>
      </header>
      <form action={action} className="auth-form" noValidate>
        <AuthPasswordField
          autoComplete="new-password"
          error={state.fieldErrors?.password}
          hint="Użyj co najmniej 8 znaków, jednej litery i jednej cyfry."
          label="Nowe hasło"
          minLength={8}
          name="password"
          placeholder="Wpisz nowe hasło"
          required
        />
        <AuthPasswordField
          autoComplete="new-password"
          error={state.fieldErrors?.confirmPassword}
          label="Potwierdź hasło"
          minLength={8}
          name="confirmPassword"
          placeholder="Powtórz nowe hasło"
          required
        />
        {state.error ? <AuthAlert>{state.error}</AuthAlert> : null}
        <button
          aria-busy={pending || undefined}
          className="auth-primary"
          disabled={pending}
          type="submit"
        >
          {pending ? <span aria-hidden="true" className="wy-spinner" /> : null}
          <span>{pending ? "Zapisywanie…" : "Zapisz nowe hasło"}</span>
          <AuthIcon name="arrow" />
        </button>
      </form>
    </>
  );
}
