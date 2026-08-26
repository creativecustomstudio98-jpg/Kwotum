"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FocusEvent } from "react";

import {
  isPanelContextNavigationItemActive,
  type PanelContextNavigationItem,
} from "./panel-context-navigation-model";

export function PanelModuleNavigation({
  ariaLabel,
  items,
}: Readonly<{
  ariaLabel: string;
  items: ReadonlyArray<PanelContextNavigationItem>;
}>) {
  const pathname = usePathname();

  function keepFocusedDestinationVisible(event: FocusEvent<HTMLElement>) {
    if (!(event.target instanceof HTMLElement)) return;
    event.target.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  return (
    <nav
      aria-label={ariaLabel}
      className="panel-module-navigation"
      onFocus={keepFocusedDestinationVisible}
    >
      <div className="panel-module-navigation__track">
        {items.map((item) => {
          const active = isPanelContextNavigationItemActive(pathname, item.href);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              href={item.href}
              key={item.href}
              prefetch={false}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function PanelModuleNavigationSkeleton({ itemCount = 3 }: { itemCount?: number }) {
  return (
    <div aria-hidden="true" className="panel-module-navigation panel-module-navigation--loading">
      <div className="panel-module-navigation__track">
        {Array.from({ length: itemCount }, (_, index) => (
          <i key={index} />
        ))}
      </div>
    </div>
  );
}
