import { createHash } from "node:crypto";

import type { FlowDocument } from "@wyceno/validation";

export function normalizeFlowConsentHashes(document: FlowDocument): FlowDocument {
  const leadCapture = document.leadCapture;
  if (!leadCapture) return document;

  return {
    ...document,
    leadCapture: {
      ...leadCapture,
      ...(leadCapture.marketingEmailConsent
        ? {
            marketingEmailConsent: {
              ...leadCapture.marketingEmailConsent,
              textHash: sha256Hex(leadCapture.marketingEmailConsent.label),
            },
          }
        : {}),
      privacyNotice: {
        ...leadCapture.privacyNotice,
        textHash: sha256Hex(leadCapture.privacyNotice.label),
      },
    },
  };
}

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}
