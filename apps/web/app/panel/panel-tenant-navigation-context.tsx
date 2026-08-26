"use client";

import { createContext, type ReactNode, useContext } from "react";

import type { PanelContextNavigationItem } from "./panel-context-navigation-model";

type PanelTenantNavigation = Readonly<{
  integrations: ReadonlyArray<PanelContextNavigationItem>;
  organizationRoot: string;
  settings: ReadonlyArray<PanelContextNavigationItem>;
}>;

const PanelTenantNavigationContext = createContext<PanelTenantNavigation | null>(null);

export function PanelTenantNavigationProvider({
  children,
  integrations,
  organizationRoot,
  settings,
}: PanelTenantNavigation & Readonly<{ children: ReactNode }>) {
  return (
    <PanelTenantNavigationContext.Provider value={{ integrations, organizationRoot, settings }}>
      {children}
    </PanelTenantNavigationContext.Provider>
  );
}

export function usePanelTenantNavigation(): PanelTenantNavigation {
  const value = useContext(PanelTenantNavigationContext);
  if (!value) {
    throw new Error("Tenant panel navigation must be rendered inside its organization layout.");
  }
  return value;
}
