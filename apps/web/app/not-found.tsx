import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="system-page">
      <section className="wy-state" aria-labelledby="not-found-title">
        <span aria-hidden="true" className="wy-state__mark">
          Błąd 404
        </span>
        <h1 id="not-found-title">Nie znaleźliśmy tej strony</h1>
        <p>
          Adres mógł się zmienić albo zawiera błąd. Wróć do strony głównej lub przejrzyj dostępne
          zastosowania.
        </p>
        <div className="system-page__actions">
          <Link className="wy-button wy-button--primary wy-button--medium" href="/">
            Wróć na stronę główną
          </Link>
          <Link className="wy-button wy-button--secondary wy-button--medium" href="/branze">
            Zobacz branże
          </Link>
        </div>
      </section>
    </main>
  );
}
