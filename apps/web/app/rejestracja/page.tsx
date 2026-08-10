import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentOrganizationId } from "../../lib/auth/organization-bootstrap";
import { createClient } from "../../lib/supabase/server";
import { AuthAlert } from "../auth/auth-fields";
import { AuthShell } from "../auth/auth-shell";
import { GoogleCompletionForm } from "./google-completion-form";
import { RegisterForm } from "./register-form";
import "../auth/auth-layout.css";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Rejestracja",
};

export const dynamic = "force-dynamic";

export default async function RegistrationPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const [{ error, google }, supabase] = await Promise.all([searchParams, createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const googleState = Array.isArray(google) ? google[0] : google;

  if (user && googleState !== "complete") {
    redirect("/panel");
  }

  if (user && googleState === "complete") {
    const organizationId = await getCurrentOrganizationId();
    if (organizationId) redirect("/panel");
  }

  const errorCode = Array.isArray(error) ? error[0] : error;

  return (
    <AuthShell mode="register">
      {errorCode === "google" || errorCode === "organization" ? (
        <AuthAlert>
          {errorCode === "google"
            ? "Nie udało się rozpocząć rejestracji z Google. Spróbuj ponownie."
            : "Konto zostało potwierdzone, ale konfiguracja firmy wymaga dokończenia."}
        </AuthAlert>
      ) : null}
      {user && googleState === "complete" ? <GoogleCompletionForm /> : <RegisterForm />}
    </AuthShell>
  );
}
