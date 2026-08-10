import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSafeLocalDestination } from "../../lib/auth/safe-destination";
import { createClient } from "../../lib/supabase/server";
import { AuthAlert } from "../auth/auth-fields";
import { AuthShell } from "../auth/auth-shell";
import { SignInForm } from "./sign-in-form";
import "../auth/auth-layout.css";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Logowanie",
};

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const [{ error, next }, supabase] = await Promise.all([searchParams, createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(getSafeLocalDestination(next));
  }

  const errorCode = Array.isArray(error) ? error[0] : error;

  return (
    <AuthShell mode="login">
      {errorCode === "google" || errorCode === "callback" ? (
        <AuthAlert>
          {errorCode === "google"
            ? "Nie udało się rozpocząć logowania z Google. Spróbuj ponownie."
            : "Link logowania wygasł albo został już wykorzystany. Rozpocznij ponownie."}
        </AuthAlert>
      ) : null}
      <SignInForm destination={getSafeLocalDestination(next)} />
    </AuthShell>
  );
}
