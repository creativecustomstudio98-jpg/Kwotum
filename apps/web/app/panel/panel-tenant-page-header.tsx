"use client";

import { LinkButton } from "@wyceno/ui";
import type { ReactNode } from "react";

import { PanelPageHeader } from "./panel-page-header";
import { usePanelTenantNavigation } from "./panel-tenant-navigation-context";

export function PanelTenantPageHeader({
  actions,
  currentLabel,
  description,
  navigation,
  parent,
  title,
  utilityAction,
}: Readonly<{
  actions?: ReactNode;
  currentLabel: string;
  description: ReactNode;
  navigation?: ReactNode;
  parent?: Readonly<{ hrefSuffix: string; label: string }>;
  title: ReactNode;
  utilityAction?: Readonly<{ hrefSuffix: string; label: string }>;
}>) {
  const { organizationRoot } = usePanelTenantNavigation();

  return (
    <PanelPageHeader
      actions={
        utilityAction ? (
          <LinkButton
            href={`${organizationRoot}${utilityAction.hrefSuffix}`}
            size="small"
            variant="secondary"
          >
            {utilityAction.label}
          </LinkButton>
        ) : (
          actions
        )
      }
      breadcrumbs={[
        parent
          ? { href: `${organizationRoot}${parent.hrefSuffix}`, label: parent.label }
          : { href: organizationRoot, label: "Przegląd" },
        { label: currentLabel },
      ]}
      description={description}
      navigation={navigation}
      title={title}
    />
  );
}
