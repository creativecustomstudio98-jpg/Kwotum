import { randomBytes } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../../..");
const localEnvPath = path.join(repositoryRoot, "apps/web/.env.local");
const supabaseConfigPath = path.join(repositoryRoot, "supabase/config.toml");

if (existsSync(localEnvPath)) process.loadEnvFile(localEnvPath);

const databaseUrl = process.env.DATABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!databaseUrl || !publishableKey || !serviceRoleKey || !supabaseUrl) {
  throw new Error(
    "Ustaw lokalne DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, " +
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY i SUPABASE_SERVICE_ROLE_KEY.",
  );
}

function configuredPort(section) {
  const config = readFileSync(supabaseConfigPath, "utf8");
  const sectionHeader = `[${section}]`;
  const sectionStart = config.indexOf(sectionHeader);
  if (sectionStart < 0) throw new Error(`Brak sekcji ${section} w supabase/config.toml.`);
  const sectionRemainder = config.slice(sectionStart + sectionHeader.length);
  const nextSectionOffset = sectionRemainder.search(/^\[/m);
  const sectionBody =
    nextSectionOffset < 0 ? sectionRemainder : sectionRemainder.slice(0, nextSectionOffset);
  const portMatch = sectionBody.match(/^port\s*=\s*(\d+)\s*$/m);
  if (!portMatch?.[1]) throw new Error(`Brak portu sekcji ${section} w supabase/config.toml.`);
  return portMatch[1];
}

function requireLocalEndpoint(rawUrl, expectedPort, label) {
  const endpoint = new URL(rawUrl);
  if (!["127.0.0.1", "localhost"].includes(endpoint.hostname) || endpoint.port !== expectedPort) {
    throw new Error(`${label} musi wskazywać lokalny port ${expectedPort}.`);
  }
  return endpoint;
}

requireLocalEndpoint(databaseUrl, configuredPort("db"), "DATABASE_URL");
requireLocalEndpoint(supabaseUrl, configuredPort("api"), "NEXT_PUBLIC_SUPABASE_URL");

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const client = createClient(supabaseUrl, publishableKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    env: { ...process.env, ...options.env },
    encoding: options.capture ? "utf8" : undefined,
    stdio: options.capture ? "pipe" : "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = options.capture ? result.stderr?.trim() : "";
    throw new Error(detail || `${command} zakończył się kodem ${result.status ?? "signal"}.`);
  }
  return options.capture ? result.stdout.trim() : "";
}

function query(sql) {
  return run("psql", [databaseUrl, "-X", "-v", "ON_ERROR_STOP=1", "-At", "-c", sql], {
    capture: true,
    env: { PGCONNECT_TIMEOUT: "5" },
  });
}

const sqlLiteral = (value) => `'${String(value).replaceAll("'", "''")}'`;
const suffix = `${Date.now()}-${randomBytes(4).toString("hex")}`;
const email = `panel-e2e-${suffix}@example.test`;
const password = randomBytes(32).toString("base64url");
const organizationName = `Panel E2E ${suffix}`;
const organizationSlug = `panel-e2e-${suffix}`;
const artifactRoot = mkdtempSync(path.join(tmpdir(), "wyceno-panel-e2e-"));

let organizationId;
let userId;

async function removeFixture() {
  const cleanupErrors = [];

  if (organizationId) {
    try {
      const objectPaths = query(`
        select name
        from storage.objects
        where bucket_id = 'tenant-private'
          and name like ${sqlLiteral(`${organizationId}/%`)};
      `)
        .split("\n")
        .filter(Boolean);
      if (objectPaths.length > 0) {
        const { error } = await admin.storage.from("tenant-private").remove(objectPaths);
        if (error) throw error;
      }
    } catch (error) {
      cleanupErrors.push(`Storage: ${error instanceof Error ? error.message : String(error)}`);
    }

    try {
      query(`
        begin;
        alter table public.organization_members
          disable trigger organization_members_protect_last_owner;
        alter table public.flow_versions
          disable trigger flow_versions_protect_snapshot;
        alter table public.session_answers
          disable trigger session_answers_protect_submitted;
        do $cleanup$
        declare
          target_org uuid := ${sqlLiteral(organizationId)}::uuid;
          tenant_table record;
          deleted_rows bigint;
          blocked_tables integer;
          made_progress boolean;
          pass_number integer := 0;
        begin
          loop
            pass_number := pass_number + 1;
            blocked_tables := 0;
            made_progress := false;
            for tenant_table in
              select distinct columns.table_name
              from information_schema.columns columns
              join information_schema.tables tables
                on tables.table_schema = columns.table_schema
                and tables.table_name = columns.table_name
              where columns.table_schema = 'public'
                and columns.column_name = 'organization_id'
                and columns.table_name <> 'organizations'
                and tables.table_type = 'BASE TABLE'
              order by columns.table_name
            loop
              begin
                execute format(
                  'delete from public.%I where organization_id = $1',
                  tenant_table.table_name
                ) using target_org;
                get diagnostics deleted_rows = row_count;
                made_progress := made_progress or deleted_rows > 0;
              exception when foreign_key_violation then
                blocked_tables := blocked_tables + 1;
              end;
            end loop;
            exit when blocked_tables = 0;
            if not made_progress or pass_number > 50 then
              raise exception 'tenant cleanup stalled with % blocked tables', blocked_tables;
            end if;
          end loop;
          delete from public.organizations where id = target_org;
        end
        $cleanup$;
        alter table public.session_answers
          enable trigger session_answers_protect_submitted;
        alter table public.flow_versions
          enable trigger flow_versions_protect_snapshot;
        alter table public.organization_members
          enable trigger organization_members_protect_last_owner;
        commit;
      `);
    } catch (error) {
      cleanupErrors.push(`Organizacja: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (userId) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) cleanupErrors.push(`Użytkownik: ${error.message}`);
  }

  if (organizationId || userId) {
    try {
      const leftovers = query(`
        select
          (select count(*) from public.organizations where id = ${sqlLiteral(
            organizationId ?? "00000000-0000-0000-0000-000000000000",
          )}::uuid),
          (select count(*) from auth.users where id = ${sqlLiteral(
            userId ?? "00000000-0000-0000-0000-000000000000",
          )}::uuid),
          (select count(*) from storage.objects
            where bucket_id = 'tenant-private'
              and name like ${sqlLiteral(`${organizationId ?? "missing"}/%`)});
      `);
      if (leftovers !== "0|0|0") cleanupErrors.push(`Pozostałości fixture'u: ${leftovers}.`);
    } catch (error) {
      cleanupErrors.push(
        `Weryfikacja cleanupu: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  if (cleanupErrors.length > 0) throw new Error(cleanupErrors.join("\n"));
}

let primaryError;

try {
  console.log("[panel-e2e] Buduję immutable artefakt standalone...");
  run("pnpm", ["build"]);

  const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password,
    user_metadata: { display_name: "Anna Kowalska" },
  });
  if (createUserError || !createdUser.user) {
    throw createUserError ?? new Error("Supabase nie zwrócił utworzonego użytkownika.");
  }
  userId = createdUser.user.id;

  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;

  const { data: organizationRows, error: organizationError } = await client.rpc(
    "create_organization",
    {
      organization_name: organizationName,
      organization_slug: organizationSlug,
    },
  );
  if (organizationError) throw organizationError;
  organizationId = organizationRows?.[0]?.id;
  if (!organizationId) throw new Error("RPC nie zwróciło identyfikatora organizacji.");
  await client.auth.signOut();

  if (
    query(
      `select exists(select 1 from public.organizations where id = ${sqlLiteral(
        organizationId,
      )}::uuid and created_by = ${sqlLiteral(userId)}::uuid);`,
    ) !== "t"
  ) {
    throw new Error("DATABASE_URL i lokalne Auth nie wskazują tego samego projektu Supabase.");
  }

  console.log("[panel-e2e] Tworzę syntetyczne dane tenantowe...");
  const seedOutput = run(
    process.execPath,
    [path.join(scriptDirectory, "seed-panel-visual-qa.mjs")],
    {
      capture: true,
      env: {
        PANEL_VISUAL_QA_ORGANIZATION_ID: organizationId,
        PANEL_VISUAL_QA_USER_ID: userId,
      },
    },
  );
  const fixture = JSON.parse(seedOutput.split("\n").at(-1));
  if (!fixture.flowId || !fixture.editorFlowId) {
    throw new Error("Seed nie zwrócił obu wymaganych procesów.");
  }

  console.log("[panel-e2e] Uruchamiam 16 scenariuszy panelu i bezstanowy podgląd...");
  run(
    "pnpm",
    [
      "exec",
      "playwright",
      "test",
      "tests/e2e/panel.spec.ts",
      "tests/e2e/flow-preview-sharing.spec.ts",
      "--workers=1",
    ],
    {
      env: {
        PANEL_E2E_EDITOR_FLOW_ID: fixture.editorFlowId,
        PANEL_E2E_EMAIL: email,
        PANEL_E2E_FLOW_ID: fixture.flowId,
        PANEL_E2E_ORGANIZATION_ID: organizationId,
        PANEL_E2E_PASSWORD: password,
        PANEL_E2E_ARTIFACT_ROOT: artifactRoot,
        PLAYWRIGHT_REUSE_EXISTING_SERVER: "false",
      },
    },
  );
} catch (error) {
  primaryError = error;
} finally {
  console.log("[panel-e2e] Usuwam jednorazowe dane...");
  try {
    await removeFixture();
  } catch (cleanupError) {
    primaryError = primaryError
      ? new AggregateError([primaryError, cleanupError], "Test i cleanup zakończyły się błędem.")
      : cleanupError;
  }
  rmSync(artifactRoot, { force: true, recursive: true });
}

if (primaryError) throw primaryError;
console.log("[panel-e2e] PASS — testy zakończone, liczba pozostałości: 0.");
