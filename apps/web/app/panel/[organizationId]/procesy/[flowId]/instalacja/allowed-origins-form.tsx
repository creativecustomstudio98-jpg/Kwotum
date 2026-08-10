"use client";

import { Button } from "@wyceno/ui";
import { useActionState } from "react";

import { type AllowedOriginsActionState, updateAllowedOriginsAction } from "./actions";

const initialAllowedOriginsActionState: AllowedOriginsActionState = {
  error: null,
  success: null,
};

export function AllowedOriginsForm({
  flowId,
  organizationId,
  origins,
}: Readonly<{
  flowId: string;
  organizationId: string;
  origins: ReadonlyArray<string>;
}>) {
  const [state, action, pending] = useActionState(
    updateAllowedOriginsAction,
    initialAllowedOriginsActionState,
  );

  return (
    <form action={action} className="panel-card allowed-origins-form">
      <input name="organizationId" type="hidden" value={organizationId} />
      <input name="flowId" type="hidden" value={flowId} />
      <div className="panel-card__header">
        <div>
          <h2>Dozwolone domeny</h2>
          <p>Tylko te witryny mogą osadzić ten formularz.</p>
        </div>
        <span className="allowed-origins-form__status">Ochrona aktywna</span>
      </div>
      <label>
        <span>Originy witryn — po jednym w wierszu</span>
        <textarea
          defaultValue={origins.join("\n")}
          maxLength={3000}
          name="origins"
          placeholder={"https://firma.pl\nhttps://www.firma.pl"}
          rows={4}
          spellCheck={false}
        />
      </label>
      <p className="allowed-origins-form__note">
        Wpisz dokładny adres HTTPS bez ścieżki. Pusta lista wyłącza osadzanie zewnętrzne; hosted
        link Kwotum nadal działa.
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
      <Button disabled={pending} size="small" type="submit">
        {pending ? "Zapisuję…" : "Zapisz domeny"}
      </Button>
    </form>
  );
}
