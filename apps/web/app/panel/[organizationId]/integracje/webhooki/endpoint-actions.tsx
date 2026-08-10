"use client";

import { Button } from "@wyceno/ui";
import { useActionState } from "react";

import {
  disableWebhookEndpointAction,
  enqueueWebhookTestAction,
  rotateWebhookSecretAction,
  type WebhookRotateActionState,
  type WebhookTestActionState,
} from "./actions";

export function WebhookEndpointActions({
  endpointId,
  organizationId,
  rotateRequestId,
  testRequestId,
}: Readonly<{
  endpointId: string;
  organizationId: string;
  rotateRequestId: string;
  testRequestId: string;
}>) {
  const initialRotateState: WebhookRotateActionState = {
    error: null,
    requestId: rotateRequestId,
    secret: null,
    secretVersion: null,
  };
  const initialTestState: WebhookTestActionState = {
    deliveryId: null,
    error: null,
    requestId: testRequestId,
  };
  const [rotation, rotateAction, rotatePending] = useActionState(
    rotateWebhookSecretAction,
    initialRotateState,
  );
  const [test, testAction, testPending] = useActionState(
    enqueueWebhookTestAction,
    initialTestState,
  );
  return (
    <div className="webhook-endpoint-actions">
      <form action={testAction}>
        <input name="endpointId" type="hidden" value={endpointId} />
        <input name="organizationId" type="hidden" value={organizationId} />
        <input name="requestId" type="hidden" value={test.requestId} />
        <Button disabled={testPending} size="small" type="submit" variant="secondary">
          {testPending ? "Sprawdzam…" : "Wyślij test"}
        </Button>
      </form>
      <form
        action={rotateAction}
        onSubmit={(event) => {
          if (
            !window.confirm(
              "Obrócić sekret? Odbiorca musi zacząć używać nowego sekretu w ciągu 15 minut.",
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <input name="endpointId" type="hidden" value={endpointId} />
        <input name="organizationId" type="hidden" value={organizationId} />
        <input name="requestId" type="hidden" value={rotation.requestId} />
        <Button disabled={rotatePending} size="small" type="submit" variant="secondary">
          {rotatePending ? "Obracam…" : "Obróć sekret"}
        </Button>
      </form>
      <form
        action={disableWebhookEndpointAction}
        onSubmit={(event) => {
          if (
            !window.confirm(
              "Wyłączyć endpoint? Oczekujące dostawy zostaną przeniesione do dead letter.",
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <input name="endpointId" type="hidden" value={endpointId} />
        <input name="organizationId" type="hidden" value={organizationId} />
        <Button size="small" type="submit" variant="secondary">
          Wyłącz
        </Button>
      </form>
      {test.error || rotation.error ? (
        <p className="lead-action-error" role="alert">
          {test.error ?? rotation.error}
        </p>
      ) : null}
      {test.deliveryId ? (
        <p className="webhook-action-status" role="status">
          Test dodany do kolejki. ID dostawy: <code>{test.deliveryId}</code>
        </p>
      ) : null}
      {rotation.secret ? (
        <div className="webhook-secret-result" role="status">
          <strong>Nowy sekret v{rotation.secretVersion} — skopiuj teraz</strong>
          <code>{rotation.secret}</code>
          <span>Przez 15 minut odbiorca powinien akceptować stary i nowy sekret.</span>
        </div>
      ) : null}
    </div>
  );
}
