import Image from "next/image";
import Link from "next/link";

export default function OrganizationPickerLoading() {
  return (
    <main
      aria-busy="true"
      className="organization-picker organization-picker--loading wy-panel-theme"
    >
      <header className="organization-picker__header">
        <Link className="organization-picker__brand" href="/" aria-label="Kwotum — strona główna">
          <Image alt="" height={34} priority src="/kwotum-logo-v3.png" width={34} />
          <strong>Kwotum</strong>
        </Link>
        <span aria-hidden="true" className="organization-picker__loading-logout" />
      </header>
      <div className="organization-picker__shell">
        <aside className="organization-picker__intro">
          <div className="organization-picker__intro-copy">
            <h1>Wybierz organizację</h1>
            <p>Wczytujemy dostępne obszary pracy.</p>
          </div>
        </aside>
        <section className="organization-picker__workspace" aria-label="Wczytywanie organizacji">
          <div className="organization-picker__loading-toolbar">
            <span />
            <span />
          </div>
          <div className="organization-picker__loading-list">
            <span />
            <span />
          </div>
          <p className="wy-sr-only" role="status">
            Wczytujemy organizacje.
          </p>
        </section>
      </div>
    </main>
  );
}
