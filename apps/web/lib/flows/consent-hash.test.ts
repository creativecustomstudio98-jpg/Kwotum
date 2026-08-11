import { flowTemplates, type FlowDocument } from "@wyceno/validation";
import { describe, expect, it } from "vitest";

import { normalizeFlowConsentHashes } from "./consent-hash";

describe("normalizeFlowConsentHashes", () => {
  it("recomputes privacy and marketing hashes without mutating the input", () => {
    const source = structuredClone(flowTemplates[0]!.snapshot) as FlowDocument;
    source.leadCapture = {
      contactPolicy: "phone_required",
      filesEnabled: false,
      leadCaptureSchemaVersion: 2,
      marketingEmailConsent: {
        label: "Chcę otrzymywać informacje marketingowe pocztą elektroniczną.",
        textHash: "a".repeat(64),
        version: "marketing-v1",
      },
      privacyNotice: {
        label: "Potwierdzam zapoznanie się z informacją o przetwarzaniu danych.",
        policyUrl: "https://example.test/polityka",
        textHash: "b".repeat(64),
        version: "privacy-v1",
      },
    };

    const normalized = normalizeFlowConsentHashes(source);

    expect(normalized).not.toBe(source);
    expect(source.leadCapture.privacyNotice.textHash).toBe("b".repeat(64));
    expect(normalized.leadCapture?.privacyNotice.textHash).toBe(
      "6addff4bfbcd3e60c7882bb83e768a208a97a098f191101a1ae1381ab9619444",
    );
    expect(normalized.leadCapture?.marketingEmailConsent?.textHash).toBe(
      "a160d14aaa6a7a401f5438c1b97ad06a12ee2aff37ef784a6a57f66ba72c8cad",
    );
  });

  it("keeps documents without lead capture unchanged", () => {
    const source = structuredClone(flowTemplates[0]!.snapshot) as FlowDocument;
    expect(normalizeFlowConsentHashes(source)).toBe(source);
  });
});
