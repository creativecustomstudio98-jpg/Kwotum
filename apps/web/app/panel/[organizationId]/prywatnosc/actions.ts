"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantContext } from "../../../../lib/auth/tenant-context";
import { setPrivacyRetention } from "../../../../lib/privacy/service";

export type PrivacyActionState = Readonly<{ error: string | null; success: string | null }>;

export async function setRetentionAction(
  _previous: PrivacyActionState,
  formData: FormData,
): Promise<PrivacyActionState> {
  const organizationId = z.uuid().safeParse(formData.get("organizationId"));
  const enabled = formData.get("enabled") === "on";
  const retentionDays = z.coerce
    .number()
    .int()
    .min(30)
    .max(3650)
    .safeParse(formData.get("retentionDays"));
  if (!organizationId.success || (enabled && !retentionDays.success)) {
    return { error: "Retencja musi wynosić od 30 do 3650 dni.", success: null };
  }
  try {
    const context = await requireTenantContext(organizationId.data);
    await setPrivacyRetention(
      context,
      enabled && retentionDays.success ? retentionDays.data : null,
    );
    revalidatePath(`/panel/${organizationId.data}/prywatnosc`);
    return {
      error: null,
      success: enabled ? "Polityka retencji została aktywowana." : "Retencja została wyłączona.",
    };
  } catch {
    return { error: "Nie udało się zapisać polityki retencji.", success: null };
  }
}
