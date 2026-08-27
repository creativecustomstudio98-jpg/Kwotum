"use client";

import { OrganizationPickerFrame } from "./organization-picker-frame";

export default function OrganizationPickerError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <OrganizationPickerFrame>
      <section
        aria-labelledby="organization-error-title"
        className="organization-picker__state organization-picker__error-state panel-card"
      >
        <strong id="organization-error-title">Nie wczytaliśmy organizacji</strong>
        <p>Sprawdź połączenie i spróbuj ponownie.</p>
        <button onClick={reset} type="button">
          Spróbuj ponownie
        </button>
      </section>
    </OrganizationPickerFrame>
  );
}
