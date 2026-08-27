import { assertCapability, type TenantContext } from "@wyceno/database";
import type { OutputInfo } from "sharp";

import { validateWidgetFileMetadata } from "../public-api/file-validation";
import { scanFileForMalware } from "../security/malware-scanner";
import { createServiceClient } from "../supabase/service";
import { createClient } from "../supabase/server";
import type { FlowMediaAsset } from "./media-assets";

export const maximumFlowMediaInputBytes = 5_242_880;
export const flowMediaAccept = "image/jpeg,image/png,image/webp";

export type NormalizedFlowMedia = Readonly<{
  bytes: Uint8Array;
  height: number;
  sha256: string;
  width: number;
}>;

export async function normalizeFlowMedia(
  file: File,
  scan: typeof scanFileForMalware = scanFileForMalware,
): Promise<NormalizedFlowMedia> {
  if (file.size < 1 || file.size > maximumFlowMediaInputBytes) {
    throw new Error("Zdjęcie może mieć maksymalnie 5 MiB.");
  }
  const input = new Uint8Array(await file.arrayBuffer());
  const valid = validateWidgetFileMetadata({ bytes: input, mimeType: file.type, name: file.name });
  if (!valid || file.type === "application/pdf") {
    throw new Error("Dozwolone są wyłącznie prawidłowe pliki JPEG, PNG i WebP.");
  }
  const scanResult = await scan(input);
  if (scanResult.status !== "clean") {
    throw new Error(
      scanResult.status === "infected"
        ? "Plik został odrzucony przez kontrolę bezpieczeństwa."
        : "Nie udało się bezpiecznie sprawdzić pliku.",
    );
  }

  let output: { data: Buffer; info: OutputInfo };
  try {
    // Keep the native addon out of read-only panel routes. Only the upload path
    // needs libvips, and Next.js traces its runtime assets for that API route.
    const { default: sharp } = await import("sharp");
    output = await sharp(input, { failOn: "warning", limitInputPixels: 24_000_000 })
      .rotate()
      .resize({
        fit: "inside",
        height: 1200,
        width: 1600,
        withoutEnlargement: true,
      })
      .webp({ effort: 4, quality: 82 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new Error("Nie udało się bezpiecznie odczytać zdjęcia.");
  }
  if (output.info.width < 320 || output.info.height < 180) {
    throw new Error("Zdjęcie musi mieć co najmniej 320 × 180 px.");
  }
  if (output.data.byteLength > maximumFlowMediaInputBytes) {
    throw new Error("Zdjęcie po przetworzeniu przekracza limit 5 MiB.");
  }
  const outputBytes = Uint8Array.from(output.data);
  const sha256 = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", outputBytes)),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
  return {
    bytes: outputBytes,
    height: output.info.height,
    sha256,
    width: output.info.width,
  };
}

export async function createFlowMediaAsset(
  context: TenantContext,
  file: File,
): Promise<FlowMediaAsset> {
  assertCapability(context, "flow:write");
  const normalized = await normalizeFlowMedia(file);
  const assetId = crypto.randomUUID();
  const objectPath = `${context.organizationId}/flow-assets/${assetId}.webp`;
  const originalName = file.name.split(/[\\/]/u).at(-1)?.trim() ?? "zdjecie";
  const supabase = await createClient();
  const { error: reservationError } = await supabase.from("flow_media_assets").insert({
    created_by: context.userId,
    height: normalized.height,
    id: assetId,
    mime_type: "image/webp",
    object_path: objectPath,
    organization_id: context.organizationId,
    original_name: originalName,
    sha256: normalized.sha256,
    size_bytes: normalized.bytes.byteLength,
    status: "pending",
    width: normalized.width,
  });
  if (reservationError) throw new Error("Nie udało się zarezerwować zdjęcia.");

  const service = createServiceClient();
  const upload = await service.storage.from("tenant-private").upload(objectPath, normalized.bytes, {
    cacheControl: "31536000",
    contentType: "image/webp",
    upsert: false,
  });
  if (upload.error) {
    await supabase
      .from("flow_media_assets")
      .update({ status: "rejected" })
      .eq("id", assetId)
      .eq("organization_id", context.organizationId);
    throw new Error("Nie udało się zapisać zdjęcia.");
  }

  const readyAt = new Date().toISOString();
  const ready = await supabase
    .from("flow_media_assets")
    .update({ ready_at: readyAt, status: "ready" })
    .eq("id", assetId)
    .eq("organization_id", context.organizationId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (ready.error || !ready.data) {
    await service.storage.from("tenant-private").remove([objectPath]);
    throw new Error("Nie udało się potwierdzić zdjęcia.");
  }
  const signed = await service.storage.from("tenant-private").createSignedUrl(objectPath, 3600);
  if (signed.error || !signed.data?.signedUrl) {
    throw new Error("Zdjęcie zapisano, ale nie udało się przygotować podglądu.");
  }
  return {
    height: normalized.height,
    id: assetId,
    name: originalName,
    previewUrl: signed.data.signedUrl,
    sizeBytes: normalized.bytes.byteLength,
    width: normalized.width,
  };
}
