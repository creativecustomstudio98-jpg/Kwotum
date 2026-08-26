import { AuthorizationError } from "@wyceno/database";
import { LinkButton } from "@wyceno/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireTenantContext } from "../../../../../../lib/auth/tenant-context";
import { getFlowInstallation } from "../../../../../../lib/installation/service";
import { PanelPageHeader } from "../../../../panel-page-header";
import { InstallationPanel } from "./installation-panel";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Podgląd i udostępnianie procesu",
};

export const dynamic = "force-dynamic";

export default async function FlowInstallationPage({
  params,
}: Readonly<{
  params: Promise<{ flowId: string; organizationId: string }>;
}>) {
  const { flowId, organizationId } = await params;
  const context = await requireTenantContext(organizationId);
  let installation;
  try {
    installation = await getFlowInstallation(context, flowId);
  } catch (error) {
    if (error instanceof AuthorizationError && error.code === "NOT_FOUND") notFound();
    throw error;
  }

  const appOrigin = new URL(process.env.APP_URL ?? "http://localhost:3000").origin;

  return (
    <main className="panel-workspace installation-panel installation-panel--m7">
      <PanelPageHeader
        actions={
          <LinkButton
            href={`/panel/${organizationId}/procesy/${flowId}`}
            size="small"
            variant="secondary"
          >
            Wróć do buildera
          </LinkButton>
        }
        breadcrumbs={[
          { href: `/panel/${organizationId}/procesy`, label: "Procesy" },
          {
            href: `/panel/${organizationId}/procesy/${flowId}`,
            label: installation.flowName,
          },
          { label: "Podgląd i udostępnianie" },
        ]}
        description={`Publikacja i instalacja procesu w organizacji ${installation.organizationName}.`}
        title="Podgląd i udostępnianie"
      />
      <div className="panel-page">
        {installation.publicId && installation.publishedAt ? (
          <InstallationPanel
            allowedOrigins={installation.allowedOrigins}
            appOrigin={appOrigin}
            currentVersion={installation.currentVersion ?? 1}
            flowId={flowId}
            flowName={installation.flowName}
            invitations={installation.invitations}
            lastWidgetOpenedAt={installation.lastWidgetOpenedAt}
            organizationId={organizationId}
            manifest={installation.manifest}
            publicId={installation.publicId}
            publishedAt={installation.publishedAt}
            wordpressConnection={installation.wordpressConnection}
          />
        ) : (
          <section className="panel-card installation-empty">
            <p className="panel-topbar__eyebrow">Proces nieopublikowany</p>
            <h2>Najpierw opublikuj proces</h2>
            <p>
              Publiczny identyfikator i bezpieczny kod instalacyjny powstaną dopiero po
              zatwierdzeniu wersji procesu.
            </p>
            <LinkButton href={`/panel/${organizationId}/procesy/${flowId}`}>
              Wróć i opublikuj
            </LinkButton>
          </section>
        )}
      </div>
    </main>
  );
}
