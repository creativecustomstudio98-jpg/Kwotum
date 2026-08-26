import Link from "next/link";
import type { ReactNode } from "react";

import { PanelIcon } from "./panel-icon";

export type PanelBreadcrumb = Readonly<{
  href?: string;
  label: string;
}>;

export function PanelPageHeader({
  actions,
  backHref,
  backLabel = "Wróć",
  breadcrumbs,
  description,
  eyebrow,
  navigation,
  title,
}: Readonly<{
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  breadcrumbs?: ReadonlyArray<PanelBreadcrumb>;
  description?: ReactNode;
  eyebrow?: string;
  navigation?: ReactNode;
  title: ReactNode;
}>) {
  return (
    <header className="panel-page-header">
      <div className="panel-topbar">
        <div className="panel-topbar__context">
          {backHref ? (
            <Link
              aria-label={backLabel}
              className="panel-topbar__back"
              href={backHref}
              prefetch={false}
            >
              <PanelIcon name="arrow-left" />
            </Link>
          ) : null}
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav aria-label="Okruszki" className="panel-breadcrumbs">
              <ol>
                {breadcrumbs.map((breadcrumb, index) => {
                  const current = index === breadcrumbs.length - 1;
                  return (
                    <li key={`${breadcrumb.label}-${index}`}>
                      {breadcrumb.href && !current ? (
                        <Link href={breadcrumb.href} prefetch={false}>
                          {breadcrumb.label}
                        </Link>
                      ) : (
                        <span aria-current={current ? "page" : undefined}>{breadcrumb.label}</span>
                      )}
                      {!current ? <PanelIcon aria-hidden="true" name="chevron-right" /> : null}
                    </li>
                  );
                })}
              </ol>
            </nav>
          ) : (
            <span className="panel-context-label">{eyebrow ?? "Panel"}</span>
          )}
        </div>
        {actions ? <div className="panel-topbar__actions">{actions}</div> : null}
      </div>
      <div className="panel-page-intro">
        <div>
          <h1>{title}</h1>
          {description ? <div className="panel-topbar__description">{description}</div> : null}
        </div>
      </div>
      {navigation ? <div className="panel-page-header__navigation">{navigation}</div> : null}
    </header>
  );
}
