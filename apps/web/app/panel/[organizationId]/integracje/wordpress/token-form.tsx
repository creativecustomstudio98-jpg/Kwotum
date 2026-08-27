"use client";

import { Button, FieldMessage, FormField, Input } from "@wyceno/ui";
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
        <FormField id="wordpress-site-origin" label="Origin strony WordPress">
          <Input
            autoComplete="url"
            className="integration-url-input"
            id="wordpress-site-origin"
            name="siteOrigin"
            placeholder="https://firma.pl"
            required
            type="url"
          />
        </FormField>
        <Button loading={pending} loadingLabel="Generuję…" type="submit">
          Wygeneruj token instalacyjny
        </Button>
      </form>
      {state.error ? (
        <FieldMessage className="wordpress-token-message" tone="error">
          {state.error}
        </FieldMessage>
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
