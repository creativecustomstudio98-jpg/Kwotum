import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type OrganizationPickerFrameProps = Readonly<{
  busy?: boolean;
  children: ReactNode;
  headerAction?: ReactNode;
}>;

export function OrganizationPickerFrame({
  busy = false,
  children,
  headerAction,
}: OrganizationPickerFrameProps) {
  return (
    <main aria-busy={busy || undefined} className="organization-picker wy-panel-theme">
      <header className="organization-picker__header">
        <Link aria-label="Kwotum — strona główna" className="organization-picker__brand" href="/">
          <Image alt="" height={34} priority src="/kwotum-logo-v3.png" width={34} />
          <strong>Kwotum</strong>
        </Link>
        {headerAction}
      </header>

      <div className="organization-picker__content">
        <header className="organization-picker__intro">
          <h1>Wybierz organizację</h1>
          <p>Wybierz organizację, w której chcesz pracować</p>
        </header>
        {children}
      </div>
    </main>
  );
}
