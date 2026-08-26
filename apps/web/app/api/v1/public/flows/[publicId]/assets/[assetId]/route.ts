import { z } from "zod";

import { createServiceClient } from "../../../../../../../../lib/supabase/service";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ assetId: string; publicId: string }> },
): Promise<Response> {
  const values = await params;
  const publicId = z.uuid().safeParse(values.publicId);
  const assetId = z.uuid().safeParse(values.assetId);
  if (!publicId.success || !assetId.success) return new Response(null, { status: 404 });

  const service = createServiceClient();
  const resolved = await service.rpc("resolve_public_flow_asset", {
    target_asset_id: assetId.data,
    target_public_flow_id: publicId.data,
  });
  const asset = resolved.data?.[0];
  if (resolved.error || !asset) return new Response(null, { status: 404 });
  const download = await service.storage.from("tenant-private").download(asset.object_path);
  if (download.error) return new Response(null, { status: 404 });

  return new Response(download.data, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(download.data.size),
      "Content-Type": asset.mime_type,
      ETag: `"${asset.sha256}"`,
      "X-Content-Type-Options": "nosniff",
    },
    status: 200,
  });
}
