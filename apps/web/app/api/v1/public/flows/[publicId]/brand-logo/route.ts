import { z } from "zod";

import { createServiceClient } from "../../../../../../../lib/supabase/service";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ publicId: string }> },
): Promise<Response> {
  const publicId = z.uuid().safeParse((await params).publicId);
  if (!publicId.success) return new Response(null, { status: 404 });
  const service = createServiceClient();
  const resolved = await service.rpc("resolve_public_brand_logo", {
    target_public_flow_id: publicId.data,
  });
  const asset = resolved.data?.[0];
  if (resolved.error || !asset) return new Response(null, { status: 404 });
  const download = await service.storage.from("tenant-private").download(asset.object_path);
  if (download.error) return new Response(null, { status: 404 });
  return new Response(download.data, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "Content-Length": String(download.data.size),
      "Content-Type": asset.mime_type,
      ETag: `"${asset.sha256}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
