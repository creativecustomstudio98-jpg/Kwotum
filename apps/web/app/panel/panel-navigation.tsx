"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { PanelIcon } from "./panel-icon";
import { PanelNavigationIcon } from "./panel-navigation-icon";
import {
  isMobilePanelDetailPath,
  isPanelNavigationItemActive,
  splitMobileNavigationItems,
  type PanelNavigationItem,
} from "./panel-navigation-model";

const SIDEBAR_PREFERENCE_KEY = "lorum:panel-sidebar-collapsed";
const SIDEBAR_PREFERENCE_EVENT = "lorum:panel-sidebar-preference";
let volatileSidebarPreference = false;

export function PanelNavigation({
  items,
  notificationsHref,
  organizationName,
  userName,
}: {
  items: ReadonlyArray<PanelNavigationItem>;
  notificationsHref: string;
  organizationName: string;
  userName: string;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const moreDialogRef = useRef<HTMLElement>(null);
  const collapsed = useSyncExternalStore(
    subscribeToSidebarPreference,
    getSidebarPreference,
    getServerSidebarPreference,
  );
  const organizationRoot = items.find((item) => item.icon === "dashboard")?.href ?? pathname;
  const { primary: mobilePrimaryItems, secondary: mobileSecondaryItems } =
    splitMobileNavigationItems(items);
  const mobileNavigationHidden = isMobilePanelDetailPath(pathname, organizationRoot);
  const settingsItem = mobileSecondaryItems.find((item) => item.icon === "settings");
  const moreActive =
    pathname === notificationsHref ||
    pathname === `${organizationRoot}/prywatnosc` ||
    pathname === `${organizationRoot}/start` ||
    mobileSecondaryItems.some((item) =>
      isPanelNavigationItemActive(pathname, item.href, organizationRoot),
    );

  useEffect(() => {
    if (!moreOpen) return;

    const previousOverflow = document.body.style.overflow;
    const focusable = () =>
      Array.from(
        moreDialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    document.body.style.overflow = "hidden";
    focusable()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMoreOpen(false);
        requestAnimationFrame(() => moreButtonRef.current?.focus());
        return;
      }

      if (event.key !== "Tab") return;
      const itemsInDialog = focusable();
      const first = itemsInDialog[0];
      const last = itemsInDialog.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 56rem)");
    const closeOutsideMobile = (event: MediaQueryListEvent) => {
      if (!event.matches) setMoreOpen(false);
    };

    mobileQuery.addEventListener("change", closeOutsideMobile);
    return () => mobileQuery.removeEventListener("change", closeOutsideMobile);
  }, []);

  function toggleSidebar() {
    const nextPreference = !collapsed;
    volatileSidebarPreference = nextPreference;

    try {
      window.localStorage.setItem(SIDEBAR_PREFERENCE_KEY, String(nextPreference));
    } catch {
      // Preferencja działa w bieżącej karcie również bez dostępu do localStorage.
    }

    window.dispatchEvent(new Event(SIDEBAR_PREFERENCE_EVENT));
  }

  return (
    <>
      <aside
        aria-label={`Nawigacja organizacji: ${organizationName}`}
        className="panel-rail"
        data-collapsed={collapsed}
        id="panel-sidebar"
      >
        <div className="panel-rail__header">
          <Link aria-label="Kwotum — wybór organizacji" className="panel-rail__brand" href="/panel">
            <span className="panel-rail__brand-mark">
              <Image alt="" height={38} priority src="/Logoicon.svg" width={38} />
            </span>
            <span className="panel-rail__brand-copy">
              <strong className="panel-rail__brand-name">Kwotum</strong>
              <small>Panel operacyjny</small>
            </span>
          </Link>
          <button
            aria-controls="panel-primary-navigation"
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Rozwiń menu boczne" : "Zwiń menu boczne"}
            className="panel-rail__toggle"
            onClick={toggleSidebar}
            title={collapsed ? "Rozwiń menu" : "Zwiń menu"}
            type="button"
          >
            <PanelIcon name="chevron-left" />
          </button>
        </div>
        <nav aria-label="Narzędzia organizacji" id="panel-primary-navigation">
          {items.map((item) => {
            const active = isPanelNavigationItemActive(pathname, item.href, organizationRoot);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={active ? "is-active" : undefined}
                href={item.href}
                key={item.href}
              >
                <span aria-hidden="true" className="panel-rail__nav-icon">
                  <PanelNavigationIcon name={item.icon} />
                </span>
                <span className="panel-rail__label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div aria-label="Skróty i konto" className="panel-rail__utilities" role="group">
          <Link aria-label="Powiadomienia" href={notificationsHref}>
            <span aria-hidden="true" className="panel-rail__nav-icon">
              <PanelNavigationIcon name="notification" />
            </span>
            <span className="panel-rail__label">Powiadomienia</span>
          </Link>
          <Link aria-label="Pomoc" href="/jak-dziala">
            <span aria-hidden="true" className="panel-rail__nav-icon">
              <PanelNavigationIcon name="help" />
            </span>
            <span className="panel-rail__label">Pomoc</span>
          </Link>
          <Link
            aria-label={`Zmień organizację. Zalogowano jako ${userName} w ${organizationName}`}
            className="panel-rail__organization"
            href="/panel"
          >
            <span aria-hidden="true" className="panel-rail__avatar">
              {initials(userName)}
            </span>
            <span className="panel-rail__account-copy">
              <strong>{userName}</strong>
              <small>{organizationName}</small>
            </span>
          </Link>
        </div>
      </aside>

      <nav
        aria-label="Główna nawigacja panelu"
        className="panel-mobile-navigation"
        data-mobile-hidden={mobileNavigationHidden}
      >
        {mobilePrimaryItems.map((item) => {
          const active = isPanelNavigationItemActive(pathname, item.href, organizationRoot);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`panel-mobile-navigation__item${active ? " is-active" : ""}`}
              href={item.href}
              key={item.href}
            >
              <span className="panel-mobile-navigation__icon">
                <PanelNavigationIcon name={item.icon} strokeWidth={1.65} />
              </span>
              <span>{item.mobileLabel ?? item.label}</span>
            </Link>
          );
        })}
        <button
          ref={moreButtonRef}
          aria-controls="panel-mobile-more"
          aria-expanded={moreOpen}
          aria-label="Więcej opcji panelu"
          className={`panel-mobile-navigation__item panel-mobile-navigation__more${
            moreActive || moreOpen ? " is-active" : ""
          }`}
          onClick={() => setMoreOpen((current) => !current)}
          type="button"
        >
          <span className="panel-mobile-navigation__icon">
            <PanelNavigationIcon name="more" strokeWidth={1.55} />
          </span>
          <span>Więcej</span>
        </button>
      </nav>

      {moreOpen && !mobileNavigationHidden ? (
        <div className="panel-mobile-more-layer">
          <button
            aria-label="Zamknij menu po dotknięciu tła"
            className="panel-mobile-more__backdrop"
            onClick={() => {
              setMoreOpen(false);
              requestAnimationFrame(() => moreButtonRef.current?.focus());
            }}
            tabIndex={-1}
            type="button"
          />
          <section
            ref={moreDialogRef}
            aria-labelledby="panel-mobile-more-title"
            aria-modal="true"
            className="panel-mobile-more"
            id="panel-mobile-more"
            role="dialog"
          >
            <div aria-hidden="true" className="panel-mobile-more__handle" />
            <header className="panel-mobile-more__header">
              <div>
                <span>Menu panelu</span>
                <h2 id="panel-mobile-more-title">Więcej</h2>
              </div>
              <button
                aria-label="Zamknij menu Więcej"
                className="panel-mobile-more__close"
                onClick={() => {
                  setMoreOpen(false);
                  requestAnimationFrame(() => moreButtonRef.current?.focus());
                }}
                type="button"
              >
                <PanelIcon name="close" />
              </button>
            </header>

            <Link
              aria-label={`Zmień organizację. Zalogowano jako ${userName} w ${organizationName}`}
              className="panel-mobile-more__account"
              href="/panel"
              onClick={() => setMoreOpen(false)}
            >
              <span aria-hidden="true" className="panel-mobile-more__avatar">
                {initials(userName)}
              </span>
              <span>
                <strong>{userName}</strong>
                <small>{organizationName}</small>
              </span>
              <PanelIcon name="chevron-right" />
            </Link>

            <nav aria-label="Pozostałe narzędzia panelu" className="panel-mobile-more__links">
              {mobileSecondaryItems.map((item) => {
                const active = isPanelNavigationItemActive(pathname, item.href, organizationRoot);
                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={active ? "is-active" : undefined}
                    href={item.href}
                    key={item.href}
                    onClick={() => setMoreOpen(false)}
                  >
                    <span>
                      <PanelNavigationIcon name={item.icon} />
                    </span>
                    <strong>{item.label}</strong>
                    <PanelIcon name="chevron-right" />
                  </Link>
                );
              })}
              {settingsItem ? (
                <Link
                  aria-current={pathname === `${organizationRoot}/prywatnosc` ? "page" : undefined}
                  className={
                    pathname === `${organizationRoot}/prywatnosc` ? "is-active" : undefined
                  }
                  href={`${organizationRoot}/prywatnosc`}
                  onClick={() => setMoreOpen(false)}
                >
                  <span>
                    <PanelNavigationIcon name="privacy" />
                  </span>
                  <strong>Dane i prywatność</strong>
                  <PanelIcon name="chevron-right" />
                </Link>
              ) : null}
              <Link
                aria-current={pathname === notificationsHref ? "page" : undefined}
                className={pathname === notificationsHref ? "is-active" : undefined}
                href={notificationsHref}
                onClick={() => setMoreOpen(false)}
              >
                <span>
                  <PanelNavigationIcon name="notification" />
                </span>
                <strong>Powiadomienia</strong>
                <PanelIcon name="chevron-right" />
              </Link>
              <Link href="/jak-dziala" onClick={() => setMoreOpen(false)}>
                <span>
                  <PanelNavigationIcon name="help" />
                </span>
                <strong>Pomoc i instrukcje</strong>
                <PanelIcon name="external" />
              </Link>
            </nav>
          </section>
        </div>
      ) : null}
    </>
  );
}

function initials(value: string): string {
  const words = value.trim().split(/\s+/).slice(0, 2);
  return words.map((word) => word[0]?.toLocaleUpperCase("pl-PL") ?? "").join("") || "OR";
}

function subscribeToSidebarPreference(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SIDEBAR_PREFERENCE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SIDEBAR_PREFERENCE_EVENT, onStoreChange);
  };
}

function getSidebarPreference(): boolean {
  try {
    const storedPreference = window.localStorage.getItem(SIDEBAR_PREFERENCE_KEY);
    return storedPreference === null ? volatileSidebarPreference : storedPreference === "true";
  } catch {
    return volatileSidebarPreference;
  }
}

function getServerSidebarPreference(): boolean {
  return false;
}
