import { AuthorizationError, hasCapability } from "@wyceno/database";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireTenantContext } from "../../../../../lib/auth/tenant-context";
import { listFlowMediaAssets } from "../../../../../lib/flows/media-assets";
import { getFlowDraft } from "../../../../../lib/flows/service";
import { FlowBuilder } from "./flow-builder";

export const metadata: Metadata = { title: "Edytor procesu" };
export const dynamic = "force-dynamic";

export default async function FlowBuilderPage({
  params,
}: {
  params: Promise<{ flowId: string; organizationId: string }>;
}) {
  const { flowId, organizationId } = await params;
  const context = await requireTenantContext(organizationId);
  let flow;
  let mediaAssets;
  try {
    [flow, mediaAssets] = await Promise.all([
      getFlowDraft(context, flowId),
      listFlowMediaAssets(context),
    ]);
  } catch (error) {
    if (error instanceof AuthorizationError && error.code === "NOT_FOUND") notFound();
    throw error;
  }

  return (
    <main className="panel-workspace panel-workspace--builder panel-workspace--builder-m7">
      <FlowBuilder
        canPublish={hasCapability(context, "flow:publish")}
        flowId={flow.id}
        initialDocument={flow.document}
        initialMediaAssets={mediaAssets}
        initialName={flow.name}
        initialRevision={flow.draftRevision}
        organizationId={organizationId}
      />
    </main>
  );
}
