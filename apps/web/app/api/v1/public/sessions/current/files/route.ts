import { widgetFileUploadResponseSchema, widgetSessionTokenSchema } from "@wyceno/validation";
import { z } from "zod";

import {
  errorResponse,
  jsonResponse,
  mapDatabaseError,
  optionsResponse,
  requestId,
} from "../../../../../../../lib/public-api/http";
import {
  maxWidgetFileSize,
  validateWidgetFileMetadata,
} from "../../../../../../../lib/public-api/file-validation";
import { scanFileForMalware } from "../../../../../../../lib/security/malware-scanner";
import { createPublicClient } from "../../../../../../../lib/supabase/public";
import { createServiceClient } from "../../../../../../../lib/supabase/service";

export const runtime = "nodejs";

const reservationSchema = z.object({ fileId: z.uuid() }).strict();
const maxMultipartOverhead = 65_536;

export function OPTIONS(): Response {
  return optionsResponse();
}

async function readLimitedBody(request: Request, limit: number): Promise<Uint8Array | null> {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export async function POST(request: Request): Promise<Response> {
  const id = requestId(request);
  const token = widgetSessionTokenSchema.safeParse(request.headers.get("x-wyceno-session"));
  if (!token.success) {
    return errorResponse("SESSION_NOT_FOUND", "Nie znaleziono sesji.", 404, id);
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > maxWidgetFileSize + maxMultipartOverhead) {
    return errorResponse("INVALID_FILE", "Plik przekracza limit 25 MiB.", 413, id);
  }

  let form: FormData;
  try {
    const body = await readLimitedBody(request, maxWidgetFileSize + maxMultipartOverhead);
    if (!body) {
      return errorResponse("INVALID_FILE", "Plik przekracza limit 25 MiB.", 413, id);
    }
    form = await new Response(body.buffer as ArrayBuffer, {
      headers: { "Content-Type": request.headers.get("content-type") ?? "" },
    }).formData();
  } catch {
    return errorResponse("INVALID_FILE", "Nie udało się odczytać pliku.", 400, id);
  }
  const candidate = form.get("file");
  if (!(candidate instanceof File) || candidate.size < 1 || candidate.size > maxWidgetFileSize) {
    return errorResponse("INVALID_FILE", "Wybierz plik nie większy niż 25 MiB.", 400, id);
  }
  const bytes = new Uint8Array(await candidate.arrayBuffer());
  const validFile = validateWidgetFileMetadata({
    bytes,
    mimeType: candidate.type,
    name: candidate.name,
  });
  if (!validFile) {
    return errorResponse("INVALID_FILE", "Zawartość pliku nie zgadza się z jego typem.", 400, id);
  }
  const malwareScan = await scanFileForMalware(bytes);
  if (malwareScan.status === "infected") {
    return errorResponse(
      "INVALID_FILE",
      "Plik został odrzucony przez kontrolę bezpieczeństwa.",
      400,
      id,
    );
  }
  if (malwareScan.status === "unavailable") {
    return errorResponse(
      "UNAVAILABLE",
      "Skanowanie pliku jest chwilowo niedostępne. Spróbuj ponownie.",
      503,
      id,
    );
  }
  const sha256 = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  const publicClient = createPublicClient();
  const { data: reservationData, error: reservationError } = await publicClient.rpc(
    "reserve_widget_file",
    {
      file_extension: validFile.canonicalExtension,
      file_sha256: sha256,
      mime_type: candidate.type,
      original_name: validFile.originalName,
      session_token: token.data,
      size_bytes: candidate.size,
    },
  );
  if (reservationError) return mapDatabaseError(reservationError, "session", id);
  const reservation = reservationSchema.safeParse(reservationData);
  if (!reservation.success) {
    return errorResponse("UNAVAILABLE", "Nie udało się przygotować uploadu.", 503, id);
  }

  const service = createServiceClient();
  const { data: storedFile, error: storedFileError } = await service
    .from("lead_files")
    .select("object_path")
    .eq("id", reservation.data.fileId)
    .single();
  if (storedFileError) {
    return errorResponse("UNAVAILABLE", "Nie udało się przygotować uploadu.", 503, id);
  }
  const upload = await service.storage
    .from("tenant-private")
    .upload(storedFile.object_path, bytes, {
      cacheControl: "3600",
      contentType: candidate.type,
      upsert: false,
    });
  if (upload.error) {
    await publicClient.rpc("reject_widget_file", {
      session_token: token.data,
      target_file_id: reservation.data.fileId,
    });
    return errorResponse("UNAVAILABLE", "Nie udało się bezpiecznie zapisać pliku.", 503, id);
  }

  const { data: completedData, error: completedError } = await publicClient.rpc(
    "complete_widget_file",
    {
      session_token: token.data,
      target_file_id: reservation.data.fileId,
    },
  );
  if (completedError) {
    await service.storage.from("tenant-private").remove([storedFile.object_path]);
    await publicClient.rpc("reject_widget_file", {
      session_token: token.data,
      target_file_id: reservation.data.fileId,
    });
    return mapDatabaseError(completedError, "session", id);
  }
  const completed = widgetFileUploadResponseSchema.safeParse(completedData);
  if (!completed.success) {
    return errorResponse("UNAVAILABLE", "Nie udało się potwierdzić pliku.", 503, id);
  }
  return jsonResponse(completed.data, { requestId: id, status: 201 });
}
