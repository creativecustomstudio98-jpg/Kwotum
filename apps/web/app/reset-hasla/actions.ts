"use server";

import { type AuthFieldErrors, validateResetPassword } from "../../lib/auth/forms";
import { createClient } from "../../lib/supabase/server";

export type ResetPasswordState = Readonly<{
  error?: string;
  fieldErrors?: AuthFieldErrors;
  status?: "success";
}>;

export async function resetPassword(
  _previousState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const validation = validateResetPassword(formData);
  if (!validation.success) {
    return { fieldErrors: validation.errors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: "Link resetujący wygasł albo jest nieważny. Poproś o nowy link.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: validation.data.password,
  });
  if (error) {
    return {
      error: "Nie udało się zapisać nowego hasła. Poproś o nowy link.",
    };
  }

  return { status: "success" };
}
