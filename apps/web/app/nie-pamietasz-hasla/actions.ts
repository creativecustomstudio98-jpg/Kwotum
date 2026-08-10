"use server";

import { type AuthFieldErrors, validateRecoveryEmail } from "../../lib/auth/forms";
import { siteOrigin } from "../../lib/marketing/metadata";
import { createClient } from "../../lib/supabase/server";

export type RecoveryState = Readonly<{
  email?: string;
  error?: string;
  fieldErrors?: AuthFieldErrors;
  status?: "sent";
}>;

export async function requestPasswordReset(
  _previousState: RecoveryState,
  formData: FormData,
): Promise<RecoveryState> {
  const validation = validateRecoveryEmail(formData);
  if (!validation.success) {
    return { fieldErrors: validation.errors };
  }

  const callbackUrl = new URL("/auth/callback", siteOrigin);
  callbackUrl.searchParams.set("next", "/reset-hasla");
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(validation.data.email, {
    redirectTo: callbackUrl.toString(),
  });

  if (error) {
    return {
      error: "Nie udało się wysłać wiadomości. Odczekaj chwilę i spróbuj ponownie.",
    };
  }

  return {
    email: validation.data.email,
    status: "sent",
  };
}
