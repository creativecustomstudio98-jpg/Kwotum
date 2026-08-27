import { assertCapability, type TenantContext } from "@wyceno/database";

import { createClient } from "../supabase/server";

export type FlowMediaAsset = Readonly<{
  height: number;
  id: string;
  name: string;
  previewUrl: string;
  sizeBytes: number;
  width: number;
}>;

export async function listFlowMediaAssets(context: TenantContext): Promise<FlowMediaAsset[]> {
  assertCapability(context, "flow:read");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("flow_media_assets")
    .select("id, original_name, object_path, size_bytes, width, height")
    .eq("organization_id", context.organizationId)
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(40);
  if (error) throw new Error("Nie udało się pobrać biblioteki zdjęć.");

  return Promise.all(
    data.map(async (asset) => {
      const signed = await supabase.storage
        .from("tenant-private")
        .createSignedUrl(asset.object_path, 3600);
      if (signed.error || !signed.data?.signedUrl) {
        throw new Error("Nie udało się przygotować podglądu zdjęcia.");
      }
      return {
        height: asset.height,
        id: asset.id,
        name: asset.original_name,
        previewUrl: signed.data.signedUrl,
        sizeBytes: asset.size_bytes,
        width: asset.width,
      };
    }),
  );
}
