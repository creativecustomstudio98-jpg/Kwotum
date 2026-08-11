import { widgetFileUploadResponseSchema, widgetSessionTokenSchema } from "@wyceno/validation";
import { z } from "zod";

import {
  errorResponse,
  jsonResponse,
  mapDatabaseError,
  requestId,
} from "../../../../../../../lib/public-api/http";
import {
  guardPublicOptions,
  guardPublicRequest,
} from "../../../../../../../lib/public-api/request-guard";
import {
  maxWidgetFileSize,
  validateWidgetFileMetadata,
} from "../../../../../../../lib/public-api/file-validation";
import { scanFileForMalware } from "../../../../../../../lib/security/malware-scanner";
import { createServiceClient } from "../../../../../../../lib/supabase/service";

export const runtime = "nodejs";

const reservationSchema = z.object({ fileId: z.uuid() }).strict();
const maxMultipartOverhead = 65_536;

export async function OPTIONS(request: Request): Promise<Response> {
  return guardPublicOptions(request);
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
  const rawToken = request.headers.get("x-wyceno-session");
  const guard = await guardPublicRequest(
    request,
    "file",
    { sessionToken: rawToken ?? undefined },
    id,
  );
  if (!guard.allowed) return guard.response;
  const { corsOrigin } = guard.context;
  const token = widgetSessionTokenSchema.safeParse(rawToken);
  if (!token.success) {
    return errorResponse("SESSION_NOT_FOUND", "Nie znaleziono sesji.", 404, id, corsOrigin);
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > maxWidgetFileSize + maxMultipartOverhead) {
    return errorResponse("INVALID_FILE", "Plik przekracza limit 25 MiB.", 413, id, corsOrigin);
  }

  let form: FormData;
  try {
    const body = await readLimitedBody(request, maxWidgetFileSize + maxMultipartOverhead);
    if (!body) {
      return errorResponse("INVALID_FILE", "Plik przekracza limit 25 MiB.", 413, id, corsOrigin);
    }
    form = await new Response(body.buffer as ArrayBuffer, {
      headers: { "Content-Type": request.headers.get("content-type") ?? "" },
    }).formData();
  } catch {
    return errorResponse("INVALID_FILE", "Nie udało się odczytać pliku.", 400, id, corsOrigin);
  }
  const candidate = form.get("file");
  if (!(candidate instanceof File) || candidate.size < 1 || candidate.size > maxWidgetFileSize) {
    return errorResponse(
      "INVALID_FILE",
      "Wybierz plik nie większy niż 25 MiB.",
      400,
      id,
      corsOrigin,
    );
  }
  const bytes = new Uint8Array(await candidate.arrayBuffer());
  const validFile = validateWidgetFileMetadata({
    bytes,
    mimeType: candidate.type,
    name: candidate.name,
  });
  if (!validFile) {
    return errorResponse(
      "INVALID_FILE",
      "Zawartość pliku nie zgadza się z jego typem.",
      400,
      id,
      corsOrigin,
    );
  }
  const malwareScan = await scanFileForMalware(bytes);
  if (malwareScan.status === "infected") {
    return errorResponse(
      "INVALID_FILE",
      "Plik został odrzucony przez kontrolę bezpieczeństwa.",
      400,
      id,
      corsOrigin,
    );
  }
  if (malwareScan.status === "unavailable") {
    return errorResponse(
      "UNAVAILABLE",
      "Skanowanie pliku jest chwilowo niedostępne. Spróbuj ponownie.",
      503,
      id,
      corsOrigin,
    );
  }
  const sha256 = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  const service = createServiceClient();
  const { data: reservationData, error: reservationError } = await service.rpc(
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
  if (reservationError) return mapDatabaseError(reservationError, "session", id, corsOrigin);
  const reservation = reservationSchema.safeParse(reservationData);
  if (!reservation.success) {
    return errorResponse("UNAVAILABLE", "Nie udało się przygotować uploadu.", 503, id, corsOrigin);
  }

  const { data: storedFile, error: storedFileError } = await service
    .from("lead_files")
    .select("object_path")
    .eq("id", reservation.data.fileId)
    .single();
  if (storedFileError) {
    return errorResponse("UNAVAILABLE", "Nie udało się przygotować uploadu.", 503, id, corsOrigin);
  }
  const upload = await service.storage
    .from("tenant-private")
    .upload(storedFile.object_path, bytes, {
      cacheControl: "3600",
      contentType: candidate.type,
      upsert: false,
    });
  if (upload.error) {
    await service.rpc("reject_widget_file", {
      session_token: token.data,
      target_file_id: reservation.data.fileId,
    });
    return errorResponse(
      "UNAVAILABLE",
      "Nie udało się bezpiecznie zapisać pliku.",
      503,
      id,
      corsOrigin,
    );
  }

  const { data: completedData, error: completedError } = await service.rpc("complete_widget_file", {
    session_token: token.data,
    target_file_id: reservation.data.fileId,
  });
  if (completedError) {
    await service.storage.from("tenant-private").remove([storedFile.object_path]);
    await service.rpc("reject_widget_file", {
      session_token: token.data,
      target_file_id: reservation.data.fileId,
    });
    return mapDatabaseError(completedError, "session", id, corsOrigin);
  }
  const completed = widgetFileUploadResponseSchema.safeParse(completedData);
  if (!completed.success) {
    return errorResponse("UNAVAILABLE", "Nie udało się potwierdzić pliku.", 503, id, corsOrigin);
  }
  return jsonResponse(completed.data, { corsOrigin, requestId: id, status: 201 });
}
