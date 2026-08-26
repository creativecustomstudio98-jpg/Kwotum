"use client";

import { PanelModuleNavigation } from "../panel-module-navigation";
import { usePanelTenantNavigation } from "../panel-tenant-navigation-context";

export function IntegrationsNavigation() {
  const { integrations } = usePanelTenantNavigation();

  return <PanelModuleNavigation ariaLabel="Rodzaje integracji" items={integrations} />;
}
