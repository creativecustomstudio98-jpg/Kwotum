import { z } from "zod";

const nonEmptySecret = z.string().trim().min(1);
const workerSecret = z.string().min(32);

export const clientEnvSchema = z
  .object({
    NEXT_PUBLIC_POSTHOG_KEY: nonEmptySecret.optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: nonEmptySecret.optional(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: nonEmptySecret.optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: nonEmptySecret.optional(),
    NEXT_PUBLIC_WIDGET_ORIGIN: z.url(),
  })
  .strict();

export const serverEnvSchema = z
  .object({
    APP_URL: z.url(),
    CLAMAV_HOST: z
      .string()
      .trim()
      .regex(/^[a-zA-Z0-9.-]{1,253}$/)
      .optional(),
    CLAMAV_PORT: z.coerce.number().int().min(1).max(65_535).optional(),
    DATABASE_URL: nonEmptySecret.optional(),
    EMAIL_FROM: z.email().optional(),
    EMAIL_DELIVERY_MODE: z.enum(["resend", "test"]).optional(),
    MALWARE_SCAN_MODE: z.enum(["clamav", "disabled"]).optional(),
    NOTIFICATION_WORKER_SECRET: workerSecret.optional(),
    POSTHOG_HOST: z.url().optional(),
    RESEND_API_KEY: nonEmptySecret.optional(),
    RETENTION_WORKER_SECRET: workerSecret.optional(),
    SENTRY_DSN: z.url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: nonEmptySecret.optional(),
    TURNSTILE_SECRET_KEY: nonEmptySecret.optional(),
    WEBHOOK_SIGNING_SECRET: workerSecret.optional(),
    WEBHOOK_WORKER_SECRET: workerSecret.optional(),
  })
  .strict();

export const deploymentEnvSchema = z
  .object({
    APP_URL: z.url(),
    DEPLOYMENT_ENV: z.enum(["local", "preview", "staging", "production"]),
  })
  .strict()
  .superRefine((env, context) => {
    if (env.DEPLOYMENT_ENV !== "staging" && env.DEPLOYMENT_ENV !== "production") return;
    const appUrl = new URL(env.APP_URL);
    const isLoopback =
      appUrl.hostname === "localhost" ||
      appUrl.hostname === "127.0.0.1" ||
      appUrl.hostname === "[::1]";
    if (appUrl.protocol !== "https:" || isLoopback) {
      context.addIssue({
        code: "custom",
        message: "Staging and production APP_URL must use HTTPS and a non-loopback hostname.",
        path: ["APP_URL"],
      });
    }
  });

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type DeploymentEnv = z.infer<typeof deploymentEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseClientEnv(input: unknown): ClientEnv {
  return clientEnvSchema.parse(input);
}

export function parseServerEnv(input: unknown): ServerEnv {
  return serverEnvSchema.parse(input);
}

export function parseDeploymentEnv(input: unknown): DeploymentEnv {
  return deploymentEnvSchema.parse(input);
}
