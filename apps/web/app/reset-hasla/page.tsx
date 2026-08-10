import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "../../lib/supabase/server";
import { AuthIcon } from "../auth/auth-icons";
import { AuthShell } from "../auth/auth-shell";
import { ResetPasswordForm } from "./reset-password-form";
import "../auth/auth-layout.css";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Nowe hasło",
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AuthShell mode="login">
      {user ? (
        <ResetPasswordForm />
      ) : (
        <div className="auth-status">
          <span className="auth-status__symbol">
            <AuthIcon name="clock" />
          </span>
          <h1 id="reset-title">Link jest nieważny lub wygasł</h1>
          <p>Poproś o nową wiadomość, aby bezpiecznie ustawić hasło.</p>
          <div className="auth-status__actions">
            <Link className="auth-primary" href="/nie-pamietasz-hasla">
              <span>Wyślij nowy link</span>
              <AuthIcon name="arrow" />
            </Link>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
