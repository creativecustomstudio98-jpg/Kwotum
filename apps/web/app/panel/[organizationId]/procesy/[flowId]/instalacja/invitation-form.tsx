"use client";

import { Button } from "@wyceno/ui";
import { useActionState, useEffect, useRef } from "react";

import { createFlowInvitationAction, initialFlowInvitationActionState } from "./actions";

export function InvitationForm({
  flowId,
  organizationId,
}: Readonly<{ flowId: string; organizationId: string }>) {
  const [state, action, pending] = useActionState(
    createFlowInvitationAction,
    initialFlowInvitationActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const requestIdRef = useRef("");
  const requestInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state.invitationId) return;
    formRef.current?.reset();
    requestIdRef.current = "";
  }, [state.invitationId]);

  return (
    <form
      action={action}
      className="invitation-form"
      onSubmit={() => {
        if (!requestIdRef.current) requestIdRef.current = crypto.randomUUID();
        if (requestInputRef.current) requestInputRef.current.value = requestIdRef.current;
      }}
      ref={formRef}
    >
      <input name="organizationId" type="hidden" value={organizationId} />
      <input name="flowId" type="hidden" value={flowId} />
      <input name="requestId" ref={requestInputRef} type="hidden" />
      <label>
        <span>E-mail klienta</span>
        <input
          autoComplete="email"
          inputMode="email"
          maxLength={254}
          name="recipientEmail"
          placeholder="klient@firma.pl"
          required
          type="email"
        />
      </label>
      <label>
        <span>
          Imię <small>opcjonalnie</small>
        </span>
        <input autoComplete="name" maxLength={120} minLength={2} name="recipientName" />
      </label>
      <label>
        <span>
          Wiadomość <small>opcjonalnie</small>
        </span>
        <textarea
          maxLength={1000}
          name="message"
          placeholder="Dodaj krótki kontekst dla klienta…"
          rows={4}
        />
      </label>
      <p className="invitation-form__privacy">
        Wyślemy zwykły hosted link. Adres klienta ani identyfikator zaproszenia nie trafią do URL.
      </p>
      {state.error ? (
        <p className="panel-form-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="panel-form-success" role="status">
          {state.success}
        </p>
      ) : null}
      <Button disabled={pending} type="submit">
        {pending ? "Dodaję do kolejki…" : "Wyślij formularz"}
      </Button>
    </form>
  );
}
