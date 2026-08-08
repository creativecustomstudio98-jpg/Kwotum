"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const subpageNavigation = [
  { href: "/produkt", label: "Produkt" },
  { href: "/jak-dziala", label: "Jak działa" },
  { href: "/integracje", label: "Integracje" },
  { href: "/cennik", label: "Cennik" },
  { href: "/branze", label: "Branże" },
  { href: "/dla-agencji", label: "Dla agencji" },
] as const;

const homeNavigation = [
  { href: "/produkt", label: "Produkt" },
  { href: "#jak-dziala", label: "Jak to działa" },
  { href: "/integracje", label: "Integracje" },
  { href: "/cennik", label: "Cennik" },
  { href: "/branze", label: "Branże" },
  { href: "/dla-agencji", label: "Dla agencji" },
] as const;

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const isHome = pathname === "/";
  const navigation = isHome ? homeNavigation : subpageNavigation;
  const isCurrent = (href: string) => {
    if (href.startsWith("#")) return false;
    if (href === "/produkt" && pathname.startsWith("/funkcje")) return true;
    if (href === "/integracje" && pathname === "/wordpress") return true;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const focusable = () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    document.body.style.overflow = "hidden";
    focusable()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        requestAnimationFrame(() => toggleRef.current?.focus());
        return;
      }

      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0];
      const last = items.at(-1);
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
  }, [open]);

  return (
    <header
      className={`marketing-header marketing-header--v7${
        isHome ? " marketing-header--home" : " marketing-header--subpage"
      }`}
    >
      <div className="marketing-container marketing-header__inner">
        <Brand withMark />
        <nav aria-label="Główna nawigacja" className="marketing-nav">
          {navigation.map((item) => (
            <Link
              aria-current={isCurrent(item.href) ? "page" : undefined}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="marketing-header__actions">
          <Link className="marketing-header__login" href="/logowanie" prefetch={false}>
            Zaloguj się
          </Link>
          <Link
            className="marketing-header__cta"
            href={isHome ? "#przykladowy-lead" : "/jak-dziala"}
          >
            {isHome ? "Zobacz demo" : "Zobacz proces"}
          </Link>
        </div>
        <button
          ref={toggleRef}
          aria-controls="marketing-mobile-menu"
          aria-expanded={open}
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          className="marketing-menu-button"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>
      {open ? (
        <div
          ref={menuRef}
          aria-label="Menu mobilne"
          className="marketing-mobile-menu"
          id="marketing-mobile-menu"
          role="dialog"
        >
          <nav aria-label="Główna nawigacja mobilna">
            {navigation.map((item, index) => (
              <Link
                aria-current={isCurrent(item.href) ? "page" : undefined}
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                <span aria-hidden="true">0{index + 1}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="marketing-mobile-menu__actions">
            <Link href="/logowanie" onClick={() => setOpen(false)} prefetch={false}>
              Zaloguj się
            </Link>
            <Link
              className="marketing-button"
              href={isHome ? "#przykladowy-lead" : "/jak-dziala"}
              onClick={() => setOpen(false)}
            >
              {isHome ? "Zobacz demo" : "Zobacz działający proces"}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function Brand({ className, withMark = false }: { className?: string; withMark?: boolean }) {
  return (
    <Link
      aria-label="Kwotum — strona główna"
      className={`marketing-brand${className ? ` ${className}` : ""}`}
      href="/"
    >
      {withMark ? (
        <span aria-hidden="true" className="marketing-brand__mark">
          <svg fill="none" viewBox="0 0 32 32">
            <path
              d="M22.9 6.45A11.4 11.4 0 1 0 27.4 15.6M19.35 19.35 28.4 28.4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4.8"
            />
            <path
              d="M22.9 6.45A11.4 11.4 0 0 1 27.4 15.6"
              stroke="#9ad672"
              strokeLinecap="round"
              strokeWidth="4.8"
            />
          </svg>
        </span>
      ) : null}
      <span className="marketing-brand__name">kwotum</span>
    </Link>
  );
}
