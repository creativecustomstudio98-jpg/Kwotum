"use client";

import { PanelModuleNavigation } from "../panel-module-navigation";
import { usePanelTenantNavigation } from "../panel-tenant-navigation-context";

export function SettingsNavigation() {
  const { settings } = usePanelTenantNavigation();

  return <PanelModuleNavigation ariaLabel="Sekcje ustawień" items={settings} variant="segmented" />;
}
