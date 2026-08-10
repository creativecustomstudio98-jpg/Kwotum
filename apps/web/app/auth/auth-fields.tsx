"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

import { AuthIcon, type AuthIconName } from "./auth-icons";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> &
  Readonly<{
    error?: string | undefined;
    icon: AuthIconName;
    label: string;
  }>;

export function AuthTextField({ error, icon, label, ...props }: TextFieldProps) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-field__control">
        <AuthIcon className="auth-field__leading-icon" name={icon} />
        <input
          {...props}
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          className="auth-input"
          id={id}
        />
      </div>
      {error ? (
        <p className="auth-field__error" id={errorId}>
          <span aria-hidden="true">!</span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> &
  Readonly<{
    error?: string | undefined;
    hint?: ReactNode | undefined;
    label: string;
  }>;

export function AuthPasswordField({ error, hint, label, ...props }: PasswordFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-field__control">
        <AuthIcon className="auth-field__leading-icon" name="lock" />
        <input
          {...props}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className="auth-input auth-input--password"
          id={id}
          type={visible ? "text" : "password"}
        />
        <button
          aria-label={visible ? "Ukryj hasło" : "Pokaż hasło"}
          aria-pressed={visible}
          className="auth-password-toggle"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          <AuthIcon name={visible ? "eyeOff" : "eye"} />
        </button>
      </div>
      {hint ? (
        <p className="auth-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="auth-field__error" id={errorId}>
          <span aria-hidden="true">!</span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AuthAlert({
  children,
  tone = "error",
}: Readonly<{ children: ReactNode; tone?: "error" | "success" }>) {
  return (
    <div
      aria-live="polite"
      className={`auth-alert auth-alert--${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <span className="auth-alert__icon">
        <AuthIcon name={tone === "error" ? "lock" : "check"} />
      </span>
      <p>{children}</p>
    </div>
  );
}
