"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthAlert, AuthPasswordField, AuthTextField } from "../auth/auth-fields";
import { AuthIcon } from "../auth/auth-icons";
import { GoogleButton } from "../auth/google-button";
import { signIn, type SignInState } from "./actions";

const initialState: SignInState = {};

export function SignInForm({ destination }: Readonly<{ destination: string }>) {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <>
      <header className="auth-form-header">
        <h1 id="sign-in-title">Logowanie do konta</h1>
        <p>Wprowadź swoje dane, aby kontynuować.</p>
      </header>
      <form action={action} className="auth-form" noValidate>
        <input name="next" type="hidden" value={destination} />
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
        <AuthPasswordField
          autoComplete="current-password"
          error={state.fieldErrors?.password}
          label="Hasło"
          minLength={8}
          name="password"
          placeholder="Wpisz hasło"
          required
        />
        <div className="auth-form-options">
          <label className="auth-checkbox">
            <input defaultChecked name="remember" type="checkbox" />
            <span>Zapamiętaj mnie</span>
          </label>
          <Link href="/nie-pamietasz-hasla">Nie pamiętasz hasła?</Link>
        </div>
        {state.error ? <AuthAlert>{state.error}</AuthAlert> : null}
        <button
          aria-busy={pending || undefined}
          className="auth-primary"
          disabled={pending}
          type="submit"
        >
          {pending ? <span aria-hidden="true" className="wy-spinner" /> : null}
          <span>{pending ? "Logowanie…" : "Zaloguj się"}</span>
          <AuthIcon name="arrow" />
        </button>
        <div className="auth-divider">
          <span>lub</span>
        </div>
      </form>
      <GoogleButton destination={destination} source="login" />
      <p className="auth-switch">
        Nie masz jeszcze konta? <Link href="/rejestracja">Zarejestruj się</Link>
      </p>
    </>
  );
}
