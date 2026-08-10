"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantContext } from "../../../../lib/auth/tenant-context";
import {
  leadAlertEmailSchema,
  organizationNameSchema,
  updateLeadAlertEmail,
  updateOrganizationName,
} from "../../../../lib/organizations/service";

export type OrganizationSettingsActionState = Readonly<{
  error: string | null;
  success: string | null;
}>;

export async function updateOrganizationAction(
  _previousState: OrganizationSettingsActionState,
  formData: FormData,
): Promise<OrganizationSettingsActionState> {
  const organizationId = z.uuid().safeParse(formData.get("organizationId"));
  const name = organizationNameSchema.safeParse(formData.get("name"));
  if (!organizationId.success || !name.success) {
    return {
      error: "Nazwa organizacji musi mieć od 2 do 120 znaków.",
      success: null,
    };
  }

  try {
    const context = await requireTenantContext(organizationId.data);
    await updateOrganizationName(context, name.data);
    revalidatePath(`/panel/${organizationId.data}`, "layout");
    revalidatePath(`/panel/${organizationId.data}/ustawienia`);
    return { error: null, success: "Zapisano dane organizacji." };
  } catch {
    return {
      error: "Nie udało się zapisać danych organizacji.",
      success: null,
    };
  }
}

export async function updateLeadAlertEmailAction(
  _previousState: OrganizationSettingsActionState,
  formData: FormData,
): Promise<OrganizationSettingsActionState> {
  const organizationId = z.uuid().safeParse(formData.get("organizationId"));
  const email = leadAlertEmailSchema.safeParse(formData.get("leadAlertEmail"));
  if (!organizationId.success || !email.success) {
    return { error: "Podaj poprawny adres e-mail do odbioru leadów.", success: null };
  }
  try {
    const context = await requireTenantContext(organizationId.data);
    await updateLeadAlertEmail(context, email.data);
    revalidatePath(`/panel/${organizationId.data}/ustawienia`);
    return { error: null, success: "Zapisano adres dostawy leadów." };
  } catch {
    return { error: "Nie udało się zapisać adresu dostawy leadów.", success: null };
  }
}
