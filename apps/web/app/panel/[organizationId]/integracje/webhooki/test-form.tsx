"use client";

import { Button } from "@wyceno/ui";
import { useActionState } from "react";

import { PanelIcon } from "../../../panel-icon";
import { enqueueWebhookTestAction, type WebhookTestActionState } from "./actions";

export function WebhookTestForm({
  endpoints,
  organizationId,
  requestId,
}: Readonly<{
  endpoints: ReadonlyArray<{ id: string; url: string }>;
  organizationId: string;
  requestId: string;
}>) {
  const initialState: WebhookTestActionState = {
    deliveryId: null,
    error: null,
    requestId,
  };
  const [state, action, pending] = useActionState(enqueueWebhookTestAction, initialState);
  const disabled = endpoints.length === 0 || pending;

  return (
    <section className="panel-card webhook-test-card" aria-labelledby="webhook-test-title">
      <div className="panel-card__header">
        <div>
          <h2 id="webhook-test-title">Test endpointu</h2>
          <p>Wyślij syntetyczne zdarzenie bez tworzenia leada i bez danych osobowych.</p>
        </div>
      </div>
      <form action={action} className="webhook-test-form">
        <input name="organizationId" type="hidden" value={organizationId} />
        <input name="requestId" type="hidden" value={state.requestId} />
        <label>
          <span>Wybierz aktywny endpoint</span>
          <select disabled={endpoints.length === 0} name="endpointId" required>
            {endpoints.length === 0 ? (
              <option value="">Najpierw dodaj aktywny endpoint</option>
            ) : (
              endpoints.map((endpoint) => (
                <option key={endpoint.id} value={endpoint.id}>
                  {endpoint.url}
                </option>
              ))
            )}
          </select>
        </label>
        <Button disabled={disabled} type="submit" variant="secondary">
          <PanelIcon name="send" />
          {pending ? "Wysyłam test…" : "Wyślij test"}
        </Button>
      </form>
      <p className="webhook-test-note">
        <PanelIcon name="privacy" />
        Test korzysta z przykładowych danych i trafia do tej samej kolejki co produkcyjne dostawy.
      </p>
      {state.error ? (
        <p className="lead-action-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.deliveryId ? (
        <p className="webhook-action-status" role="status">
          Test dodany do kolejki. ID dostawy: <code>{state.deliveryId}</code>. Odśwież widok, aby
          zobaczyć go w historii.
        </p>
      ) : null}
    </section>
  );
}
