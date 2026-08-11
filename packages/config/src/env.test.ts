import { describe, expect, it } from "vitest";

import { parseClientEnv, parseDeploymentEnv, parseServerEnv } from "./env";

describe("environment validation", () => {
  it("keeps the browser contract limited to explicitly public values", () => {
    expect(
      parseClientEnv({
        NEXT_PUBLIC_POSTHOG_KEY: "public-project-key",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-publishable-key",
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: "public-site-key",
        NEXT_PUBLIC_WIDGET_ORIGIN: "https://widget.wyceno.test",
      }),
    ).toEqual({
      NEXT_PUBLIC_POSTHOG_KEY: "public-project-key",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-publishable-key",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "public-site-key",
      NEXT_PUBLIC_WIDGET_ORIGIN: "https://widget.wyceno.test",
    });

    expect(() =>
      parseClientEnv({
        NEXT_PUBLIC_WIDGET_ORIGIN: "https://widget.wyceno.test",
        SUPABASE_SERVICE_ROLE_KEY: "must-not-be-public",
      }),
    ).toThrow();
  });

  it("rejects invalid server URLs and accepts feature-specific secrets as optional", () => {
    expect(() => parseServerEnv({ APP_URL: "not-a-url" })).toThrow();
    expect(parseServerEnv({ APP_URL: "https://app.wyceno.test" })).toEqual({
      APP_URL: "https://app.wyceno.test",
    });
    expect(() =>
      parseServerEnv({
        APP_URL: "https://app.wyceno.test",
        NOTIFICATION_WORKER_SECRET: "too-short",
      }),
    ).toThrow();
    expect(() =>
      parseServerEnv({
        APP_URL: "https://app.wyceno.test",
        WEBHOOK_SIGNING_SECRET: "too-short",
      }),
    ).toThrow();
    expect(
      parseServerEnv({
        APP_URL: "https://app.wyceno.test",
        CLAMAV_HOST: "clamav.internal",
        CLAMAV_PORT: "3310",
        CRON_SECRET: "c".repeat(32),
        MALWARE_SCAN_MODE: "clamav",
        MONITORING_PROBE_SECRET: "m".repeat(32),
        PUBLIC_RATE_LIMIT_SECRET: "p".repeat(32),
        RETENTION_WORKER_SECRET: "r".repeat(32),
        WEBHOOK_SIGNING_SECRET: "s".repeat(32),
        WEBHOOK_WORKER_SECRET: "w".repeat(32),
      }),
    ).toMatchObject({
      CLAMAV_HOST: "clamav.internal",
      CLAMAV_PORT: 3310,
      CRON_SECRET: "c".repeat(32),
      MALWARE_SCAN_MODE: "clamav",
      MONITORING_PROBE_SECRET: "m".repeat(32),
      PUBLIC_RATE_LIMIT_SECRET: "p".repeat(32),
      WEBHOOK_WORKER_SECRET: "w".repeat(32),
    });
    expect(() =>
      parseServerEnv({
        APP_URL: "https://app.wyceno.test",
        CLAMAV_HOST: "clamav/internal",
      }),
    ).toThrow();
  });

  it("validates bounded Turnstile keys without treating the site key as a secret", () => {
    expect(
      parseClientEnv({
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
        NEXT_PUBLIC_WIDGET_ORIGIN: "https://widget.wyceno.test",
      }).NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    ).toBe("1x00000000000000000000AA");
    expect(() =>
      parseClientEnv({
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: "x".repeat(33),
        NEXT_PUBLIC_WIDGET_ORIGIN: "https://widget.wyceno.test",
      }),
    ).toThrow();
    expect(
      parseServerEnv({
        APP_URL: "https://app.wyceno.test",
        TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
      }).TURNSTILE_SECRET_KEY,
    ).toBe("1x0000000000000000000000000000000AA");
  });

  it("accepts a branded email sender without allowing header injection", () => {
    expect(
      parseServerEnv({
        APP_URL: "https://app.kwotum.pl",
        EMAIL_FROM: "Kwotum <powiadomienia@mail.kwotum.pl>",
      }).EMAIL_FROM,
    ).toBe("Kwotum <powiadomienia@mail.kwotum.pl>");
    expect(() =>
      parseServerEnv({
        APP_URL: "https://app.kwotum.pl",
        EMAIL_FROM: "Kwotum\r\nBcc: attacker@example.com <powiadomienia@mail.kwotum.pl>",
      }),
    ).toThrow();
    expect(() =>
      parseServerEnv({
        APP_URL: "https://app.kwotum.pl",
        EMAIL_FROM: "Kwotum <not-an-email>",
      }),
    ).toThrow();
    expect(() =>
      parseServerEnv({
        APP_URL: "https://app.kwotum.pl",
        EMAIL_FROM: "Kwotum, attacker@example.com <powiadomienia@mail.kwotum.pl>",
      }),
    ).toThrow();
  });

  it("rejects localhost and insecure APP_URL for staging and production", () => {
    expect(() =>
      parseDeploymentEnv({
        APP_URL: "http://localhost:3000",
        DEPLOYMENT_ENV: "production",
      }),
    ).toThrow();
    expect(() =>
      parseDeploymentEnv({
        APP_URL: "http://lorum.example",
        DEPLOYMENT_ENV: "production",
      }),
    ).toThrow();
    expect(() =>
      parseDeploymentEnv({
        APP_URL: "http://localhost:3000",
        DEPLOYMENT_ENV: "staging",
      }),
    ).toThrow();
    expect(() =>
      parseDeploymentEnv({
        APP_URL: "http://staging.kwotum.example",
        DEPLOYMENT_ENV: "staging",
      }),
    ).toThrow();
    expect(
      parseDeploymentEnv({
        APP_URL: "https://app.lorum.example",
        DEPLOYMENT_ENV: "production",
      }),
    ).toEqual({
      APP_URL: "https://app.lorum.example",
      DEPLOYMENT_ENV: "production",
    });
    expect(
      parseDeploymentEnv({
        APP_URL: "https://staging.kwotum.example",
        DEPLOYMENT_ENV: "staging",
      }),
    ).toEqual({
      APP_URL: "https://staging.kwotum.example",
      DEPLOYMENT_ENV: "staging",
    });
    expect(
      parseDeploymentEnv({
        APP_URL: "http://localhost:3000",
        DEPLOYMENT_ENV: "local",
      }),
    ).toEqual({
      APP_URL: "http://localhost:3000",
      DEPLOYMENT_ENV: "local",
    });
  });
});
