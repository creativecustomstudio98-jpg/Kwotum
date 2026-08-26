import { describe, expect, it } from "vitest";

import fortezGuidedJson from "../../../docs/pilots/configs/fortez-guided-selection.v1.json" with { type: "json" };
import fortezQuickJson from "../../../docs/pilots/configs/fortez-known-model-quick.v1.json" with { type: "json" };
import studioFormaJson from "../../../docs/pilots/configs/studio-forma-visual-brief.v1.json" with { type: "json" };
import { flowDocumentSchema, validateFlowDocument } from "./flow";

type PilotConfig = Readonly<{
  configVersion: number;
  fallbackChannels: ReadonlyArray<{
    key: "legacy_form" | "phone" | "whatsapp";
    mustRemainActive: boolean;
  }>;
  intendedCta: string;
  pilotKey: string;
  pilotStatus: string;
  snapshot: unknown;
}>;

describe("PX7 synthetic pilot configurations", () => {
  const configs = [fortezQuickJson, fortezGuidedJson, studioFormaJson] as PilotConfig[];

  it("keeps every configuration explicitly hypothetical and preserves a fallback", () => {
    expect(new Set(configs.map(({ pilotKey }) => pilotKey)).size).toBe(configs.length);
    for (const config of configs) {
      expect(config).toMatchObject({ configVersion: 1, pilotStatus: "hypothesis" });
      expect(config.intendedCta.length).toBeGreaterThan(0);
      expect(config.fallbackChannels.length).toBeGreaterThan(0);
      expect(config.fallbackChannels.every(({ mustRemainActive }) => mustRemainActive)).toBe(true);
      expect(config.fallbackChannels.some(({ key }) => key === "phone")).toBe(true);
    }
  });

  it("parses every snapshot and passes the complete graph validator", () => {
    for (const config of configs) {
      const snapshot = flowDocumentSchema.parse(config.snapshot);
      expect(validateFlowDocument(snapshot)).toEqual({ issues: [], valid: true });
      expect(snapshot.estimation).toBeUndefined();
      expect(snapshot.result.mode).toBe("no_price");
      expect(snapshot.result.action).toBe("capture_lead");
    }
  });

  it("separates the two Fortez entry intents without collecting a tracking bag", () => {
    const fortez = configs.slice(0, 2).map(({ snapshot }) => flowDocumentSchema.parse(snapshot));
    expect(fortez.map(({ experienceMode }) => experienceMode)).toEqual([
      "quick_form",
      "visual_configurator",
    ]);
    expect(
      fortez.map(
        ({ contextSchema }) =>
          contextSchema?.fields.find(({ key }) => key === "cta_source")?.systemValue,
      ),
    ).toEqual(["known_model", "guided_selection"]);
    expect(fortez.every(({ leadCapture }) => leadCapture?.leadCaptureSchemaVersion === 2)).toBe(
      true,
    );
    expect(
      fortez.every(
        ({ leadCapture }) =>
          leadCapture?.leadCaptureSchemaVersion === 2 &&
          leadCapture.contactPolicy === "phone_required",
      ),
    ).toBe(true);
  });

  it("does not reference legacy or invented media assets", () => {
    for (const config of configs) {
      const snapshot = flowDocumentSchema.parse(config.snapshot);
      expect(
        snapshot.steps.flatMap(({ options }) =>
          options.flatMap(({ presentation }) =>
            presentation?.asset === undefined ? [] : [presentation.asset],
          ),
        ),
      ).toEqual([]);
    }
  });
});
