"use client";

import { Button, LinkButton } from "@wyceno/ui";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function LeadDetailError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error("Lead detail failed to render.", error.digest ?? "no-digest");
  }, [error]);
  const { organizationId } = useParams<{ organizationId: string }>();

  return (
    <main className="panel-workspace lead-operation lead-reference-page">
      <article className="lead-reference lead-reference--m6 lead-reference--error">
        <section aria-labelledby="lead-error-title" className="lead-reference-error" role="alert">
          <p>Szczegóły leada</p>
          <h1 id="lead-error-title">Nie udało się pobrać danych</h1>
          <p>
            Odpowiedzi, pliki i historia pozostają bezpieczne. Spróbuj ponownie lub wróć do listy
            leadów.
          </p>
          <div>
            <Button onClick={reset} type="button">
              Spróbuj ponownie
            </Button>
            <LinkButton href={`/panel/${organizationId}/leady`} variant="secondary">
              Wróć do listy
            </LinkButton>
          </div>
        </section>
      </article>
    </main>
  );
}
