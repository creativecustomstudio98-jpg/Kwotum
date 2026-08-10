import { assertCapability, type TenantContext } from "@wyceno/database";

import { listFlowDrafts } from "../flows/service";
import { createClient } from "../supabase/server";

export type OnboardingState = Readonly<{
  activeFlow: Readonly<{
    id: string;
    name: string;
    publicId: string | null;
    status: "draft" | "published";
  }> | null;
  flowCount: number;
  organizationName: string;
  wordpressConnected: boolean;
}>;

export async function getOnboardingState(context: TenantContext): Promise<OnboardingState> {
  assertCapability(context, "flow:read");
  const supabase = await createClient();
  const [flows, organizationResult, publishedResult, wordpressResult] = await Promise.all([
    listFlowDrafts(context),
    supabase.from("organizations").select("name").eq("id", context.organizationId).maybeSingle(),
    supabase
      .from("published_flows")
      .select("flow_id, public_id, published_at")
      .eq("organization_id", context.organizationId)
      .order("published_at", { ascending: false })
      .limit(20),
    supabase
      .from("wordpress_connections")
      .select("id")
      .eq("organization_id", context.organizationId)
      .is("revoked_at", null)
      .limit(1),
  ]);

  if (
    organizationResult.error ||
    !organizationResult.data ||
    publishedResult.error ||
    wordpressResult.error
  ) {
    throw new Error("Nie udało się pobrać stanu uruchomienia.");
  }

  const preferredFlow = flows.find((flow) => flow.status === "published") ?? flows.at(0) ?? null;
  const publication = preferredFlow
    ? publishedResult.data.find((item) => item.flow_id === preferredFlow.id)
    : null;

  return {
    activeFlow: preferredFlow
      ? {
          id: preferredFlow.id,
          name: preferredFlow.name,
          publicId: publication?.public_id ?? null,
          status: preferredFlow.status,
        }
      : null,
    flowCount: flows.length,
    organizationName: organizationResult.data.name,
    wordpressConnected: wordpressResult.data.length > 0,
  };
}
