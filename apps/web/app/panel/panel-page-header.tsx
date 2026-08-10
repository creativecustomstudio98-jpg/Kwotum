import Link from "next/link";
import type { ReactNode } from "react";

import { PanelIcon } from "./panel-icon";

export function PanelPageHeader({
  actions,
  backHref,
  backLabel = "Wróć",
  description,
  eyebrow,
  title,
}: Readonly<{
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  description?: ReactNode;
  eyebrow?: string;
  title: ReactNode;
}>) {
  return (
    <header className="panel-topbar">
      <div className="panel-topbar__context">
        {backHref ? (
          <Link aria-label={backLabel} className="panel-topbar__back" href={backHref}>
            <PanelIcon name="arrow-left" />
          </Link>
        ) : null}
        <div>
          {eyebrow ? <p className="panel-topbar__eyebrow">{eyebrow}</p> : null}
          <h1>{title}</h1>
          {description ? <div className="panel-topbar__description">{description}</div> : null}
        </div>
      </div>
      {actions ? <div className="panel-topbar__actions">{actions}</div> : null}
    </header>
  );
}
