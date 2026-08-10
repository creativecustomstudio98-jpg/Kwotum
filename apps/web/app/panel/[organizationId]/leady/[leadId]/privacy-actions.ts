"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireTenantContext } from "../../../../../lib/auth/tenant-context";
import {
  eraseLeadPersonalData,
  releaseLeadLegalHold,
  setLeadLegalHold,
} from "../../../../../lib/privacy/service";

export type LeadPrivacyActionState = Readonly<{
  error: string | null;
  success: string | null;
}>;

const identifiers = z.object({ leadId: z.uuid(), organizationId: z.uuid() });

function parseIdentifiers(formData: FormData) {
  return identifiers.safeParse({
    leadId: formData.get("leadId"),
    organizationId: formData.get("organizationId"),
  });
}

export async function setLegalHoldAction(
  _previous: LeadPrivacyActionState,
  formData: FormData,
): Promise<LeadPrivacyActionState> {
  const ids = parseIdentifiers(formData);
  const reason = z.string().trim().min(5).max(500).safeParse(formData.get("reason"));
  if (!ids.success || !reason.success) {
    return { error: "Powód blokady musi mieć od 5 do 500 znaków.", success: null };
  }
  try {
    const context = await requireTenantContext(ids.data.organizationId);
    await setLeadLegalHold(context, ids.data.leadId, reason.data);
    revalidatePath(`/panel/${ids.data.organizationId}/leady/${ids.data.leadId}`);
    return { error: null, success: "Blokada prawna została ustawiona." };
  } catch {
    return { error: "Nie udało się ustawić blokady prawnej.", success: null };
  }
}

export async function releaseLegalHoldAction(
  _previous: LeadPrivacyActionState,
  formData: FormData,
): Promise<LeadPrivacyActionState> {
  const ids = parseIdentifiers(formData);
  if (!ids.success) return { error: "Nieprawidłowy lead.", success: null };
  try {
    const context = await requireTenantContext(ids.data.organizationId);
    await releaseLeadLegalHold(context, ids.data.leadId);
    revalidatePath(`/panel/${ids.data.organizationId}/leady/${ids.data.leadId}`);
    return { error: null, success: "Blokada prawna została zwolniona." };
  } catch {
    return { error: "Nie udało się zwolnić blokady prawnej.", success: null };
  }
}

export async function eraseLeadAction(
  _previous: LeadPrivacyActionState,
  formData: FormData,
): Promise<LeadPrivacyActionState> {
  const ids = parseIdentifiers(formData);
  const confirmation = z.literal("USUŃ").safeParse(formData.get("confirmation"));
  if (!ids.success || !confirmation.success) {
    return { error: "Wpisz dokładnie „USUŃ”, aby potwierdzić.", success: null };
  }
  try {
    const context = await requireTenantContext(ids.data.organizationId);
    await eraseLeadPersonalData(context, ids.data.leadId);
  } catch {
    return {
      error: "Nie udało się usunąć danych. Sprawdź blokadę prawną i spróbuj ponownie.",
      success: null,
    };
  }
  revalidatePath(`/panel/${ids.data.organizationId}/leady`);
  redirect(`/panel/${ids.data.organizationId}/leady`);
}
