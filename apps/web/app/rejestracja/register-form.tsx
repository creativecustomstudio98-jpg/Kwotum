"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthAlert, AuthPasswordField, AuthTextField } from "../auth/auth-fields";
import { AuthIcon } from "../auth/auth-icons";
import { GoogleButton } from "../auth/google-button";
import { register, type RegistrationState } from "./actions";

const initialState: RegistrationState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, initialState);

  if (state.status === "check-email") {
    return (
      <div className="auth-status">
        <span className="auth-status__symbol">
          <AuthIcon name="email" />
        </span>
        <h1 id="register-title">Sprawdź skrzynkę e-mail</h1>
        <p>
          Jeśli potwierdzenie konta jest wymagane, wysłaliśmy wiadomość na{" "}
          <strong>{state.email}</strong>. Po potwierdzeniu utworzymy organizację.
        </p>
        <div className="auth-status__actions">
          <Link className="auth-primary" href="/logowanie">
            <span>Przejdź do logowania</span>
            <AuthIcon name="arrow" />
          </Link>
          <Link className="auth-google-button" href="/rejestracja">
            Użyj innego adresu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="auth-form-header">
        <h1 id="register-title">Utwórz nowe konto</h1>
        <p>Wprowadź dane swojej firmy, aby rozpocząć.</p>
      </header>
      <form action={action} className="auth-form auth-form--register" noValidate>
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
        <AuthTextField
          autoComplete="name"
          error={state.fieldErrors?.fullName}
          icon="user"
          label="Imię i nazwisko"
          name="fullName"
          placeholder="Jan Kowalski"
          required
        />
        <AuthTextField
          autoComplete="organization"
          error={state.fieldErrors?.companyName}
          icon="people"
          label="Nazwa firmy"
          name="companyName"
          placeholder="Nazwa Twojej firmy"
          required
        />
        <AuthPasswordField
          autoComplete="new-password"
          error={state.fieldErrors?.password}
          label="Hasło"
          minLength={8}
          name="password"
          placeholder="Minimum 8 znaków"
          required
        />
        <AuthPasswordField
          autoComplete="new-password"
          error={state.fieldErrors?.confirmPassword}
          label="Potwierdź hasło"
          minLength={8}
          name="confirmPassword"
          placeholder="Powtórz hasło"
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
          <span>{pending ? "Tworzenie konta…" : "Załóż konto"}</span>
          <AuthIcon name="arrow" />
        </button>
        <div className="auth-divider">
          <span>lub</span>
        </div>
      </form>
      <GoogleButton destination="/rejestracja?google=complete" source="register" />
      <p className="auth-switch">
        Masz już konto? <Link href="/logowanie">Zaloguj się</Link>
      </p>
    </>
  );
}
