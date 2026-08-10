"use client";

import { Button } from "@wyceno/ui";
import { useActionState } from "react";

import { createWordPressTokenAction, type WordPressTokenActionState } from "./actions";

const initialWordPressTokenActionState = {
  error: null,
  expiresAt: null,
  siteOrigin: null,
  token: null,
} satisfies WordPressTokenActionState;

export function WordPressTokenForm({ organizationId }: { organizationId: string }) {
  const [state, action, pending] = useActionState(
    createWordPressTokenAction,
    initialWordPressTokenActionState,
  );
  return (
    <section className="panel-card wordpress-card" aria-labelledby="wordpress-token-title">
      <div className="panel-card__header">
        <div>
          <h2 id="wordpress-token-title">Połącz nową stronę</h2>
          <p>
            Token działa tylko dla wskazanego originu, wygasa po 10 minutach i znika po pierwszym
            użyciu.
          </p>
        </div>
      </div>
      <form action={action} className="wordpress-token-form">
        <input name="organizationId" type="hidden" value={organizationId} />
        <label>
          <span>Origin strony WordPress</span>
          <input
            autoComplete="url"
            id="wordpress-site-origin"
            name="siteOrigin"
            placeholder="https://firma.pl"
            required
            type="url"
          />
        </label>
        <Button disabled={pending} type="submit">
          {pending ? "Generuję…" : "Wygeneruj token instalacyjny"}
        </Button>
      </form>
      {state.error ? (
        <p className="lead-action-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.token ? (
        <div className="wordpress-token-result" role="status">
          <strong>Skopiuj teraz — token nie będzie pokazany ponownie</strong>
          <code>{state.token}</code>
          <span>
            Origin: {state.siteOrigin}. Ważny do{" "}
            {new Intl.DateTimeFormat("pl-PL", {
              dateStyle: "short",
              timeStyle: "medium",
            }).format(new Date(state.expiresAt ?? ""))}
            .
          </span>
        </div>
      ) : null}
    </section>
  );
}
