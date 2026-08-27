import { AuthorizationError } from "@wyceno/database";
import { z } from "zod";

import { requireTenantContext } from "../../../../../../lib/auth/tenant-context";
import { listFlowMediaAssets } from "../../../../../../lib/flows/media-assets";
import {
  createFlowMediaAsset,
  flowMediaAccept,
  maximumFlowMediaInputBytes,
} from "../../../../../../lib/flows/media-upload";

export const runtime = "nodejs";

function response(body: unknown, status: number, requestId: string): Response {
  return Response.json(body, {
    headers: { "Cache-Control": "private, no-store", "X-Request-Id": requestId },
    status,
  });
}

function mapError(error: unknown, requestId: string): Response {
  if (error instanceof AuthorizationError) {
    return response({ code: "NOT_FOUND", message: "Nie znaleziono zasobu." }, 404, requestId);
  }
  return response(
    {
      code: "UPLOAD_FAILED",
      message: error instanceof Error ? error.message : "Nie udało się dodać zdjęcia.",
    },
    422,
    requestId,
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
): Promise<Response> {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const organizationId = z.uuid().safeParse((await params).organizationId);
  if (!organizationId.success) return mapError(null, requestId);
  try {
    const context = await requireTenantContext(organizationId.data);
    return response({ assets: await listFlowMediaAssets(context) }, 200, requestId);
  } catch (error) {
    return mapError(error, requestId);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
): Promise<Response> {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const organizationId = z.uuid().safeParse((await params).organizationId);
  if (!organizationId.success) return mapError(null, requestId);
  try {
    const context = await requireTenantContext(organizationId.data);
    const contentType = request.headers.get("content-type") ?? "";
    const contentLengthHeader = request.headers.get("content-length");
    const contentLength = contentLengthHeader === null ? null : Number(contentLengthHeader);
    if (
      !contentType.toLowerCase().startsWith("multipart/form-data;") ||
      (contentLength !== null &&
        (!Number.isSafeInteger(contentLength) ||
          contentLength < 1 ||
          contentLength > maximumFlowMediaInputBytes + 65_536))
    ) {
      return response(
        { code: "INVALID_FILE", message: "Nieprawidłowe żądanie przesłania zdjęcia." },
        422,
        requestId,
      );
    }
    const formData = await request.formData();
    const files = formData.getAll("file");
    const file = files[0];
    if (
      files.length !== 1 ||
      [...formData.keys()].some((key) => key !== "file") ||
      !(file instanceof File) ||
      !flowMediaAccept.split(",").includes(file.type)
    ) {
      return response(
        { code: "INVALID_FILE", message: "Wybierz zdjęcie JPEG, PNG albo WebP." },
        422,
        requestId,
      );
    }
    return response({ asset: await createFlowMediaAsset(context, file) }, 201, requestId);
  } catch (error) {
    return mapError(error, requestId);
  }
}
