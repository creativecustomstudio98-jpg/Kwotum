"use client";

import { useFormStatus } from "react-dom";

import { GoogleMark } from "./auth-icons";
import { signInWithGoogle } from "./google-action";

function GoogleSubmitButton({ label }: Readonly<{ label: string }>) {
  const { pending } = useFormStatus();
  return (
    <button
      aria-busy={pending || undefined}
      className="auth-google-button"
      disabled={pending}
      type="submit"
    >
      {pending ? <span aria-hidden="true" className="wy-spinner" /> : <GoogleMark />}
      <span>{pending ? "Łączenie z Google…" : label}</span>
    </button>
  );
}

export function GoogleButton({
  destination,
  source,
}: Readonly<{
  destination: string;
  source: "login" | "register";
}>) {
  return (
    <form action={signInWithGoogle} className="auth-google-form">
      <input name="next" type="hidden" value={destination} />
      <input name="source" type="hidden" value={source} />
      <GoogleSubmitButton
        label={source === "login" ? "Zaloguj się z Google" : "Zarejestruj się z Google"}
      />
    </form>
  );
}
