"use server";

import { randomUUID } from "node:crypto";

import { redirect } from "next/navigation";

import {
  type AuthFieldErrors,
  createOrganizationSlug,
  validateOrganizationCompletion,
  validateRegistration,
} from "../../lib/auth/forms";
import { AUTH_PRIVACY_VERSION, AUTH_TERMS_VERSION } from "../../lib/auth/legal-consent";
import { createOrganizationForCurrentUser } from "../../lib/auth/organization-bootstrap";
import { siteOrigin } from "../../lib/marketing/metadata";
import { createClient } from "../../lib/supabase/server";

export type RegistrationState = Readonly<{
  email?: string;
  error?: string;
  fieldErrors?: AuthFieldErrors;
  status?: "check-email";
}>;

export type OrganizationCompletionState = Readonly<{
  error?: string;
  fieldErrors?: AuthFieldErrors;
}>;

export async function register(
  _previousState: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  const validation = validateRegistration(formData);
  if (!validation.success) {
    return { fieldErrors: validation.errors };
  }

  const organizationSlug = createOrganizationSlug(validation.data.companyName, randomUUID());
  const callbackUrl = new URL("/auth/callback", siteOrigin);
  callbackUrl.searchParams.set("next", "/panel");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: validation.data.email,
    options: {
      data: {
        display_name: validation.data.fullName,
        organization_name: validation.data.companyName,
        organization_slug: organizationSlug,
        privacy_accepted_at: new Date().toISOString(),
        privacy_version: AUTH_PRIVACY_VERSION,
        terms_accepted_at: new Date().toISOString(),
        terms_version: AUTH_TERMS_VERSION,
      },
      emailRedirectTo: callbackUrl.toString(),
    },
    password: validation.data.password,
  });

  if (error) {
    return {
      error:
        "Nie udało się utworzyć konta. Jeśli ten adres jest już używany, przejdź do logowania.",
    };
  }

  if (!data.session) {
    return {
      email: validation.data.email,
      status: "check-email",
    };
  }

  try {
    await createOrganizationForCurrentUser(validation.data.companyName, organizationSlug);
  } catch {
    return {
      error:
        "Konto powstało, ale nie udało się utworzyć organizacji. Zaloguj się ponownie, aby dokończyć.",
    };
  }

  redirect("/panel");
}

export async function completeGoogleRegistration(
  _previousState: OrganizationCompletionState,
  formData: FormData,
): Promise<OrganizationCompletionState> {
  const validation = validateOrganizationCompletion(formData);
  if (!validation.success) {
    return { fieldErrors: validation.errors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sesja wygasła. Rozpocznij rejestrację z Google ponownie." };
  }

  const displayName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata.name === "string"
        ? user.user_metadata.name
        : null;

  if (displayName) {
    await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
  }

  const consentTimestamp = new Date().toISOString();
  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      privacy_accepted_at: consentTimestamp,
      privacy_version: AUTH_PRIVACY_VERSION,
      terms_accepted_at: consentTimestamp,
      terms_version: AUTH_TERMS_VERSION,
    },
  });
  if (metadataError) {
    return {
      error: "Nie udało się zapisać akceptacji warunków. Spróbuj ponownie.",
    };
  }

  try {
    await createOrganizationForCurrentUser(
      validation.data.companyName,
      createOrganizationSlug(validation.data.companyName, randomUUID()),
    );
  } catch {
    return {
      error: "Nie udało się utworzyć organizacji. Spróbuj ponownie.",
    };
  }

  redirect("/panel");
}
