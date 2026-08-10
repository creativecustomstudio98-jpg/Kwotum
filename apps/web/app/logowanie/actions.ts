"use server";

import { redirect } from "next/navigation";

import { type AuthFieldErrors, validateSignIn } from "../../lib/auth/forms";
import { getSafeLocalDestination } from "../../lib/auth/safe-destination";
import { setSessionPersistence } from "../../lib/auth/session-preference";
import { createClient } from "../../lib/supabase/server";

export type SignInState = Readonly<{
  error?: string;
  fieldErrors?: AuthFieldErrors;
}>;

export async function signIn(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const validation = validateSignIn(formData);
  if (!validation.success) {
    return { fieldErrors: validation.errors };
  }
  const destination = getSafeLocalDestination(formData.get("next")?.toString());

  await setSessionPersistence(validation.data.remember);
  const supabase = await createClient({
    persistentSession: validation.data.remember,
  });
  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  });

  if (error) {
    return { error: "Nieprawidłowy e-mail lub hasło." };
  }

  redirect(destination);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await setSessionPersistence(true);
  redirect("/logowanie");
}
