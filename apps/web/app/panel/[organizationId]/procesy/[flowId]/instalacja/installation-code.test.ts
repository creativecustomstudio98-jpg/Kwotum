import { describe, expect, it } from "vitest";

import { installationCode, type InstallationMode } from "./installation-code";

const appOrigin = "https://app.wyceno.test";
const publicId = "00000000-0000-4000-8000-000000000001";

describe("installationCode", () => {
  it.each<InstallationMode>(["inline", "popup", "fullscreen"])(
    "pins the public API origin in the %s embed",
    (mode) => {
      const code = installationCode(appOrigin, publicId, mode);

      expect(code).toContain(
        `<script type="module" src="${appOrigin}/widget/v1/loader.js"></script>`,
      );
      expect(code).toContain(`public-id="${publicId}"`);
      expect(code).toContain(`api-base="${appOrigin}"`);
      expect(code).toContain(`mode="${mode}"`);
    },
  );

  it("keeps the popup launcher label", () => {
    expect(installationCode(appOrigin, publicId, "popup")).toContain(
      'button-label="Rozpocznij wycenę"',
    );
  });

  it("returns only the hosted URL for hosted mode", () => {
    expect(installationCode(appOrigin, publicId, "hosted")).toBe(`${appOrigin}/f/${publicId}`);
  });
});
