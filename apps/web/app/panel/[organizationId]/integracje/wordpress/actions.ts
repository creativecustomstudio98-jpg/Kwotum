"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createWordPressInstallToken,
  revokeWordPressConnection,
} from "../../../../../lib/wordpress/service";

export type WordPressTokenActionState = Readonly<{
  error: string | null;
  expiresAt: string | null;
  siteOrigin: string | null;
  token: string | null;
}>;

const initialWordPressTokenActionState: WordPressTokenActionState = {
  error: null,
  expiresAt: null,
  siteOrigin: null,
  token: null,
};

export async function createWordPressTokenAction(
  _previous: WordPressTokenActionState,
  formData: FormData,
): Promise<WordPressTokenActionState> {
  const organizationId = z.uuid().safeParse(formData.get("organizationId"));
  const siteOrigin = z.string().trim().max(255).safeParse(formData.get("siteOrigin"));
  if (!organizationId.success || !siteOrigin.success) {
    return { ...initialWordPressTokenActionState, error: "Podaj prawidłowy origin strony." };
  }
  try {
    const token = await createWordPressInstallToken(organizationId.data, siteOrigin.data);
    revalidatePath(`/panel/${organizationId.data}/integracje/wordpress`);
    return { error: null, ...token };
  } catch {
    return {
      ...initialWordPressTokenActionState,
      error: "Nie udało się utworzyć tokenu. Użyj pełnego originu HTTPS bez ścieżki.",
    };
  }
}

export async function revokeWordPressConnectionAction(formData: FormData): Promise<void> {
  const organizationId = z.uuid().safeParse(formData.get("organizationId"));
  const connectionId = z.uuid().safeParse(formData.get("connectionId"));
  if (!organizationId.success || !connectionId.success) {
    throw new Error("Nieprawidłowe połączenie.");
  }
  await revokeWordPressConnection(organizationId.data, connectionId.data);
  revalidatePath(`/panel/${organizationId.data}/integracje/wordpress`);
}
