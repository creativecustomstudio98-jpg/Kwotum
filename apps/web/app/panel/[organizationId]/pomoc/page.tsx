import type { Metadata } from "next";

import { requireTenantContext } from "../../../../lib/auth/tenant-context";
import { PanelPageHeader } from "../../panel-page-header";
import { HelpCenter } from "./help-center";
import { getAccessibleHelpGuides } from "./help-content";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Pomoc",
};

export const dynamic = "force-dynamic";

export default async function HelpPage({
  params,
}: Readonly<{
  params: Promise<{ organizationId: string }>;
}>) {
  const { organizationId } = await params;
  const context = await requireTenantContext(organizationId);
  const guides = getAccessibleHelpGuides(context, organizationId);

  return (
    <main className="panel-workspace help-center-panel">
      <PanelPageHeader
        description="Praktyczne instrukcje oparte na funkcjach dostępnych w Twojej organizacji."
        title="Pomoc"
      />
      <div className="panel-page help-center-page">
        <HelpCenter guides={guides} role={context.role} />
      </div>
    </main>
  );
}
