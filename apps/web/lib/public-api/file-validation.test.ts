import { describe, expect, it } from "vitest";

import { validateWidgetFileMetadata } from "./file-validation";

describe("validateWidgetFileMetadata", () => {
  it.each([
    ["oferta.PDF", "application/pdf", [0x25, 0x50, 0x44, 0x46, 0x2d], "pdf"],
    ["zdjecie.jpeg", "image/jpeg", [0xff, 0xd8, 0xff], "jpg"],
    ["rzut.png", "image/png", [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], "png"],
    [
      "widok.webp",
      "image/webp",
      [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50],
      "webp",
    ],
  ])("accepts matching %s content", (name, mimeType, signature, extension) => {
    expect(
      validateWidgetFileMetadata({
        bytes: new Uint8Array(signature),
        mimeType,
        name,
      }),
    ).toEqual({ canonicalExtension: extension, originalName: name });
  });

  it.each([
    ["invoice.pdf.exe", "application/pdf", [0x25, 0x50, 0x44, 0x46, 0x2d]],
    ["fake.pdf", "application/pdf", [0x4d, 0x5a, 0x90]],
    ["fake.jpg", "image/png", [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    ["payload.svg", "image/svg+xml", [0x3c, 0x73, 0x76, 0x67]],
    ["bad\u0000name.pdf", "application/pdf", [0x25, 0x50, 0x44, 0x46, 0x2d]],
  ])("rejects unsafe or inconsistent file %s", (name, mimeType, signature) => {
    expect(
      validateWidgetFileMetadata({
        bytes: new Uint8Array(signature),
        mimeType,
        name,
      }),
    ).toBeNull();
  });

  it("keeps only the basename supplied by the browser", () => {
    expect(
      validateWidgetFileMetadata({
        bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]),
        mimeType: "application/pdf",
        name: String.raw`C:\fakepath\brief.pdf`,
      }),
    ).toEqual({ canonicalExtension: "pdf", originalName: "brief.pdf" });
  });
});
