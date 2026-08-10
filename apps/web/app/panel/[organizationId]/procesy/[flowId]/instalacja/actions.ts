"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantContext } from "../../../../../../lib/auth/tenant-context";
import { createFlowInvitation } from "../../../../../../lib/installation/service";

export type FlowInvitationActionState = Readonly<{
  error: string | null;
  invitationId: string | null;
  success: string | null;
}>;

export const initialFlowInvitationActionState: FlowInvitationActionState = {
  error: null,
  invitationId: null,
  success: null,
};

const optionalNameSchema = z
  .string()
  .trim()
  .max(120)
  .transform((value) => value || null)
  .refine((value) => value === null || value.length >= 2);
const optionalMessageSchema = z
  .string()
  .trim()
  .max(1000)
  .transform((value) => value || null);

export async function createFlowInvitationAction(
  _previous: FlowInvitationActionState,
  formData: FormData,
): Promise<FlowInvitationActionState> {
  const organizationId = z.uuid().safeParse(formData.get("organizationId"));
  const flowId = z.uuid().safeParse(formData.get("flowId"));
  const requestId = z.uuid().safeParse(formData.get("requestId"));
  const recipientEmail = z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .max(254)
    .safeParse(formData.get("recipientEmail"));
  const recipientName = optionalNameSchema.safeParse(formData.get("recipientName") ?? "");
  const message = optionalMessageSchema.safeParse(formData.get("message") ?? "");
  if (
    !organizationId.success ||
    !flowId.success ||
    !requestId.success ||
    !recipientEmail.success ||
    !recipientName.success ||
    !message.success
  ) {
    return {
      error: "Sprawdź adres e-mail oraz długość imienia i wiadomości.",
      invitationId: null,
      success: null,
    };
  }
  try {
    const context = await requireTenantContext(organizationId.data);
    const invitation = await createFlowInvitation(context, {
      flowId: flowId.data,
      message: message.data,
      recipientEmail: recipientEmail.data,
      recipientName: recipientName.data,
      requestId: requestId.data,
    });
    revalidatePath(`/panel/${organizationId.data}/procesy/${flowId.data}/instalacja`);
    return {
      error: null,
      invitationId: invitation.id,
      success: "Wiadomość została bezpiecznie dodana do kolejki wysyłki.",
    };
  } catch {
    return {
      error: "Nie udało się wysłać formularza. Sprawdź publikację i spróbuj ponownie.",
      invitationId: null,
      success: null,
    };
  }
}
