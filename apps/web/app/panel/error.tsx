"use client";

import Image from "next/image";
import Link from "next/link";

export default function OrganizationPickerError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="organization-picker organization-picker--error wy-panel-theme">
      <header className="organization-picker__header">
        <Link className="organization-picker__brand" href="/" aria-label="Kwotum — strona główna">
          <Image alt="" height={34} priority src="/kwotum-logo-v3.png" width={34} />
          <strong>Kwotum</strong>
        </Link>
      </header>
      <div className="organization-picker__shell">
        <aside className="organization-picker__intro">
          <div className="organization-picker__intro-copy">
            <h1>Wybierz organizację</h1>
            <p>Nie udało się teraz pobrać Twoich obszarów pracy.</p>
          </div>
        </aside>
        <section
          className="organization-picker__workspace"
          aria-labelledby="organization-error-title"
        >
          <div className="organization-picker__empty organization-picker__error-state">
            <strong id="organization-error-title">Nie wczytaliśmy organizacji</strong>
            <p>Sprawdź połączenie i spróbuj ponownie.</p>
            <button onClick={reset} type="button">
              Spróbuj ponownie
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
