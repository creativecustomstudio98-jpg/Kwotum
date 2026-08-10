import { z } from "zod";

export const wordpressSiteOriginSchema = z
  .url()
  .max(255)
  .transform((value) => value.replace(/\/+$/, "").toLowerCase())
  .pipe(
    z
      .string()
      .regex(
        /^https:\/\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::[0-9]{1,5})?$/,
        "Podaj origin HTTPS bez ścieżki.",
      ),
  );

const versionSchema = z
  .string()
  .regex(/^\d+\.\d+(?:\.\d+)?$/)
  .max(24);

export const wordpressConnectRequestSchema = z.object({
  installToken: z.string().regex(/^[a-f0-9]{64}$/),
  phpVersion: versionSchema,
  pluginVersion: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .max(24),
  siteOrigin: wordpressSiteOriginSchema,
  wordpressVersion: versionSchema,
});

export const wordpressConnectResponseSchema = z.object({
  connectionId: z.uuid(),
  credential: z.string().regex(/^[a-f0-9]{64}$/),
  organizationName: z.string().min(2).max(120),
  siteOrigin: wordpressSiteOriginSchema,
});

export const wordpressFlowSchema = z.object({
  name: z.string().min(2).max(160),
  publicId: z.uuid(),
  version: z.number().int().positive(),
});

export const wordpressFlowsResponseSchema = z.object({
  flows: z.array(wordpressFlowSchema).max(500),
});

export const wordpressDiagnosticsResponseSchema = z.object({
  connected: z.literal(true),
  organizationName: z.string().min(2).max(120),
  serverTime: z.iso.datetime({ offset: true }),
  siteOrigin: wordpressSiteOriginSchema,
});

export const wordpressInstallTokenResponseSchema = z.object({
  expiresAt: z.iso.datetime({ offset: true }),
  siteOrigin: wordpressSiteOriginSchema,
  token: z.string().regex(/^[a-f0-9]{64}$/),
});
