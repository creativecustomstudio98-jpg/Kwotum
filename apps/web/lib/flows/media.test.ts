import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { maximumFlowMediaInputBytes, normalizeFlowMedia } from "./media-upload";

const cleanScan = async () => ({ status: "clean" as const });

describe("flow media normalization", () => {
  it("decodes a valid image, strips it to bounded WebP and hashes the output", async () => {
    const source = await sharp({
      create: { background: "#d8d2c3", channels: 3, height: 900, width: 1800 },
    })
      .jpeg()
      .toBuffer();
    const result = await normalizeFlowMedia(
      new File([source], "material.jpg", { type: "image/jpeg" }),
      cleanScan,
    );
    const metadata = await sharp(result.bytes).metadata();

    expect(metadata.format).toBe("webp");
    expect(result).toMatchObject({ height: 800, width: 1600 });
    expect(result.bytes.byteLength).toBeLessThan(maximumFlowMediaInputBytes);
    expect(result.sha256).toMatch(/^[a-f0-9]{64}$/u);
  });

  it("rejects spoofed and undersized images", async () => {
    await expect(
      normalizeFlowMedia(
        new File([new Uint8Array([1, 2, 3])], "fake.jpg", { type: "image/jpeg" }),
        cleanScan,
      ),
    ).rejects.toThrow("prawidłowe pliki");

    const tiny = await sharp({
      create: { background: "#ffffff", channels: 3, height: 100, width: 100 },
    })
      .png()
      .toBuffer();
    await expect(
      normalizeFlowMedia(new File([tiny], "tiny.png", { type: "image/png" }), cleanScan),
    ).rejects.toThrow("co najmniej 320 × 180");
  });
});
