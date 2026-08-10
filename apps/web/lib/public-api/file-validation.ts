export const maxWidgetFileSize = 26_214_400;

type FileConfiguration = Readonly<{
  extension: "jpg" | "pdf" | "png" | "webp";
  extensions: ReadonlySet<string>;
  signature: (bytes: Uint8Array) => boolean;
}>;

const decoder = new TextDecoder();

const fileTypes: Readonly<Record<string, FileConfiguration>> = {
  "application/pdf": {
    extensions: new Set(["pdf"]),
    extension: "pdf",
    signature: (bytes) =>
      bytes.length >= 5 &&
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46 &&
      bytes[4] === 0x2d,
  },
  "image/jpeg": {
    extensions: new Set(["jpeg", "jpg"]),
    extension: "jpg",
    signature: (bytes) =>
      bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  "image/png": {
    extensions: new Set(["png"]),
    extension: "png",
    signature: (bytes) =>
      bytes.length >= 8 &&
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
        (value, index) => bytes[index] === value,
      ),
  },
  "image/webp": {
    extensions: new Set(["webp"]),
    extension: "webp",
    signature: (bytes) =>
      bytes.length >= 12 &&
      decoder.decode(bytes.slice(0, 4)) === "RIFF" &&
      decoder.decode(bytes.slice(8, 12)) === "WEBP",
  },
};

export type ValidWidgetFile = Readonly<{
  canonicalExtension: FileConfiguration["extension"];
  originalName: string;
}>;

export function validateWidgetFileMetadata(
  input: Readonly<{ bytes: Uint8Array; mimeType: string; name: string }>,
): ValidWidgetFile | null {
  const originalName = input.name.split(/[\\/]/).at(-1)?.trim();
  if (!originalName || originalName.length > 255 || /[\u0000-\u001f\u007f]/.test(originalName)) {
    return null;
  }
  const configuration = fileTypes[input.mimeType];
  const suppliedExtension = originalName.split(".").at(-1)?.toLowerCase();
  if (
    !configuration ||
    !suppliedExtension ||
    !configuration.extensions.has(suppliedExtension) ||
    !configuration.signature(input.bytes)
  ) {
    return null;
  }
  return { canonicalExtension: configuration.extension, originalName };
}
