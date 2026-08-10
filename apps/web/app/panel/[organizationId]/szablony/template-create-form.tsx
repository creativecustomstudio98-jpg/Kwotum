"use client";

import { Button } from "@wyceno/ui";
import { useActionState } from "react";

import { createFlowFromTemplateAction, type FlowActionState } from "../procesy/actions";
import { PanelIcon } from "../../panel-icon";

const initialState: FlowActionState = {
  code: null,
  error: null,
  revision: null,
  success: null,
};

export function TemplateCreateForm({
  organizationId,
  templateName,
  templateSlug,
}: Readonly<{
  organizationId: string;
  templateName: string;
  templateSlug: string;
}>) {
  const [state, action, pending] = useActionState(createFlowFromTemplateAction, initialState);
  return (
    <form action={action}>
      <input name="organizationId" type="hidden" value={organizationId} />
      <input name="templateName" type="hidden" value={templateName} />
      <input name="templateSlug" type="hidden" value={templateSlug} />
      <Button
        className="template-use-button"
        disabled={pending}
        size="small"
        type="submit"
        variant="primary"
      >
        <span>{pending ? "Tworzę…" : "Użyj szablonu"}</span>
        <PanelIcon name="arrow-right" />
      </Button>
      {state.error ? (
        <p className="panel-form-error" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
