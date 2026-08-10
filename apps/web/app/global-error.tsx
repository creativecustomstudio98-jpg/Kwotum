"use client";

import Link from "next/link";

export default function GlobalErrorPage({
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <html lang="pl">
      <body>
        <main className="system-page">
          <section className="wy-state wy-state--error" aria-labelledby="global-error-title">
            <span aria-hidden="true" className="wy-state__mark">
              Błąd aplikacji
            </span>
            <h1 id="global-error-title">Nie udało się wyświetlić strony</h1>
            <p>
              Wystąpił nieoczekiwany błąd. Spróbuj ponownie. Jeśli problem wraca, przejdź do strony
              głównej.
            </p>
            <div className="system-page__actions">
              <button
                className="wy-button wy-button--primary wy-button--medium"
                onClick={reset}
                type="button"
              >
                Spróbuj ponownie
              </button>
              <Link className="wy-button wy-button--secondary wy-button--medium" href="/">
                Wróć na stronę główną
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
