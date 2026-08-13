"use client";

import { Button } from "@wyceno/ui";
import { useActionState } from "react";

import { createWebhookEndpointAction, type WebhookCreateActionState } from "./actions";

export function WebhookEndpointForm({
  organizationId,
  requestId,
}: Readonly<{ organizationId: string; requestId: string }>) {
  const initialState: WebhookCreateActionState = {
    endpointUrl: null,
    error: null,
    requestId,
    secret: null,
  };
  const [state, action, pending] = useActionState(createWebhookEndpointAction, initialState);
  return (
    <div className="webhook-endpoint-create">
      <div className="webhook-endpoint-create__copy">
        <strong id="webhook-create-title">Dodaj endpoint</strong>
        <span>Publiczny HTTPS na porcie 443, bez query, credentiali i redirectów.</span>
      </div>
      <form
        action={action}
        aria-labelledby="webhook-create-title"
        className="webhook-endpoint-form"
      >
        <input name="organizationId" type="hidden" value={organizationId} />
        <input name="requestId" type="hidden" value={state.requestId} />
        <label>
          <span className="integration-visually-hidden">URL odbiorcy</span>
          <input
            autoComplete="url"
            name="url"
            placeholder="https://hooks.firma.pl/kwotum/leads"
            required
            type="url"
          />
        </label>
        <Button disabled={pending} type="submit">
          {pending ? "Sprawdzam DNS…" : "Dodaj endpoint"}
        </Button>
      </form>
      {state.error ? (
        <p className="lead-action-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.secret ? (
        <div className="webhook-secret-result" role="status">
          <strong>Skopiuj teraz — sekret nie jest zapisany i nie pojawi się po odświeżeniu</strong>
          <code>{state.secret}</code>
          <span>
            Endpoint {state.endpointUrl} jest aktywny. Po zapisaniu sekretu odśwież widok, aby
            pojawił się na liście.
          </span>
        </div>
      ) : null}
    </div>
  );
}
