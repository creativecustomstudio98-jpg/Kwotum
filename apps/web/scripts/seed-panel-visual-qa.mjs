import { createHash, randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";

import { createClient } from "@supabase/supabase-js";
import { flowTemplates } from "../../../packages/validation/dist/templates.js";

const databaseUrl = process.env.DATABASE_URL;
const organizationId = process.env.PANEL_VISUAL_QA_ORGANIZATION_ID;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const userId = process.env.PANEL_VISUAL_QA_USER_ID;

if (!databaseUrl || !organizationId || !userId) {
  throw new Error("Ustaw DATABASE_URL, PANEL_VISUAL_QA_ORGANIZATION_ID i PANEL_VISUAL_QA_USER_ID.");
}

const databaseEndpoint = new URL(databaseUrl);
if (databaseEndpoint.hostname !== "127.0.0.1" && databaseEndpoint.hostname !== "localhost") {
  throw new Error("Seed visual QA może działać wyłącznie z lokalną bazą.");
}
if (supabaseUrl && serviceRoleKey) {
  const supabaseEndpoint = new URL(supabaseUrl);
  if (supabaseEndpoint.hostname !== "127.0.0.1" && supabaseEndpoint.hostname !== "localhost") {
    throw new Error("Seed plików visual QA może działać wyłącznie z lokalnym Supabase.");
  }
}

const sqlLiteral = (value) => `'${String(value).replaceAll("'", "''")}'`;
const jsonLiteral = (value) => `${sqlLiteral(JSON.stringify(value))}::jsonb`;
const stableUuid = (value) => {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(
    17,
    20,
  )}-${hex.slice(20)}`;
};

function query(sql) {
  const result = spawnSync("psql", [databaseUrl, "-X", "-v", "ON_ERROR_STOP=1", "-At", "-c", sql], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || "Lokalny seed SQL nie powiódł się.");
  }
  return result.stdout.trim();
}

if (
  query(
    `select exists(select 1 from public.organizations where id = ${sqlLiteral(organizationId)}::uuid);`,
  ) !== "t"
) {
  throw new Error("Lokalna organizacja visual QA nie istnieje.");
}

if (
  query(`select exists(select 1 from auth.users where id = ${sqlLiteral(userId)}::uuid);`) !== "t"
) {
  throw new Error("Lokalny użytkownik visual QA nie istnieje.");
}

query(`
  update public.profiles
  set display_name = 'Anna Kowalska'
  where id = ${sqlLiteral(userId)}::uuid;
`);

const baseTemplate = flowTemplates[0];
if (!baseTemplate) throw new Error("Brak bazowego szablonu procesu.");

const privacyText = "Akceptuję informację o przetwarzaniu danych w celu przygotowania odpowiedzi.";
const privacyHash = createHash("sha256").update(privacyText).digest("hex");
const document = structuredClone(baseTemplate.snapshot);
document.leadCapture = {
  filesEnabled: false,
  leadCaptureSchemaVersion: 1,
  privacyNotice: {
    label: privacyText,
    textHash: privacyHash,
    version: "panel-visual-qa-v1",
  },
};
document.estimation = {
  estimationSchemaVersion: 1,
  pricing: {
    baseMaxMinor: 3_500_000,
    baseMinMinor: 2_500_000,
    currency: "PLN",
    presentation: "range",
    roundingIncrementMinor: 10_000,
    rules: [
      {
        id: "premium_materials",
        label: "Wybrano materiały premium",
        operation: { maxMinor: 1_500_000, minMinor: 1_000_000, type: "add" },
        when: { operator: "equals", stepKey: "standard", value: "premium" },
      },
    ],
  },
  scoring: {
    categories: [
      { key: "low", label: "Niskie dopasowanie", minPoints: 0 },
      { key: "good", label: "Dobre dopasowanie", minPoints: 55 },
      { key: "high", label: "Wysokie dopasowanie", minPoints: 80 },
    ],
    initialPoints: 55,
    rules: [
      {
        id: "premium_scope",
        label: "Zakres zgodny z kompetencjami",
        points: 18,
        when: { operator: "equals", stepKey: "standard", value: "premium" },
      },
      {
        id: "known_budget",
        label: "Realny budżet i harmonogram",
        points: 12,
        when: { operator: "answered", stepKey: "budzet" },
      },
    ],
  },
};

const flowSlug = "visual-qa-meble";
let flowId = query(`
  select id
  from public.flows
  where organization_id = ${sqlLiteral(organizationId)}::uuid
    and slug = ${sqlLiteral(flowSlug)}
  limit 1;
`);

if (!flowId) {
  flowId = randomUUID();
  query(`
    insert into public.flows (
      id, organization_id, name, slug, draft, created_by, updated_by
    ) values (
      ${sqlLiteral(flowId)}::uuid,
      ${sqlLiteral(organizationId)}::uuid,
      'Kwalifikacja leadów — meble na wymiar',
      ${sqlLiteral(flowSlug)},
      ${jsonLiteral(document)},
      ${sqlLiteral(userId)}::uuid,
      ${sqlLiteral(userId)}::uuid
    );
  `);
} else {
  query(`
    begin;
    select set_config('request.jwt.claim.sub', ${sqlLiteral(userId)}, true);
    update public.flows
    set
      draft = ${jsonLiteral(document)},
      name = 'Kwalifikacja leadów — meble na wymiar',
      updated_by = ${sqlLiteral(userId)}::uuid
    where id = ${sqlLiteral(flowId)}::uuid
      and organization_id = ${sqlLiteral(organizationId)}::uuid;
    commit;
  `);
}

let versionId = query(`
  select id
  from public.flow_versions
  where organization_id = ${sqlLiteral(organizationId)}::uuid
    and flow_id = ${sqlLiteral(flowId)}::uuid
    and status = 'published'
  order by version_number desc
  limit 1;
`);

if (!versionId) {
  versionId = randomUUID();
  const snapshotHash = createHash("sha256").update(JSON.stringify(document)).digest("hex");
  query(`
    insert into public.flow_versions (
      id, organization_id, flow_id, version_number, status, snapshot,
      snapshot_hash, published_by
    ) values (
      ${sqlLiteral(versionId)}::uuid,
      ${sqlLiteral(organizationId)}::uuid,
      ${sqlLiteral(flowId)}::uuid,
      1,
      'published',
      ${jsonLiteral(document)},
      ${sqlLiteral(snapshotHash)},
      ${sqlLiteral(userId)}::uuid
    );
  `);
}

let publicId = query(`
  select public_id
  from public.published_flows
  where organization_id = ${sqlLiteral(organizationId)}::uuid
    and flow_id = ${sqlLiteral(flowId)}::uuid
  limit 1;
`);

if (!publicId) {
  publicId = randomUUID();
  query(`
    insert into public.published_flows (
      public_id, organization_id, flow_id, flow_version_id
    ) values (
      ${sqlLiteral(publicId)}::uuid,
      ${sqlLiteral(organizationId)}::uuid,
      ${sqlLiteral(flowId)}::uuid,
      ${sqlLiteral(versionId)}::uuid
    );
  `);
}

let editorFlowId = "";
const editorTemplate = flowTemplates.at(-1);
for (const template of flowTemplates.slice(1)) {
  const demoSlug = `visual-qa-${template.slug}`;
  let templateFlowId = query(`
    select id
    from public.flows
    where organization_id = ${sqlLiteral(organizationId)}::uuid
      and slug = ${sqlLiteral(demoSlug)}
    limit 1;
  `);
  if (!templateFlowId) {
    templateFlowId = randomUUID();
    query(`
      insert into public.flows (
        id, organization_id, name, slug, draft, created_by, updated_by
      ) values (
        ${sqlLiteral(templateFlowId)}::uuid,
        ${sqlLiteral(organizationId)}::uuid,
        ${sqlLiteral(template.name)},
        ${sqlLiteral(demoSlug)},
        ${jsonLiteral(template.snapshot)},
        ${sqlLiteral(userId)}::uuid,
        ${sqlLiteral(userId)}::uuid
      );
    `);
  } else if (template === editorTemplate) {
    query(`
      begin;
      select set_config('request.jwt.claim.sub', ${sqlLiteral(userId)}, true);
      update public.flows
      set
        draft = ${jsonLiteral(template.snapshot)},
        name = ${sqlLiteral(template.name)},
        updated_by = ${sqlLiteral(userId)}::uuid
      where id = ${sqlLiteral(templateFlowId)}::uuid
        and organization_id = ${sqlLiteral(organizationId)}::uuid;
      commit;
    `);
  }
  if (template === editorTemplate) editorFlowId = templateFlowId;
}

const wordpressCredentialHash = createHash("sha256")
  .update(`${organizationId}:panel-visual-qa-wordpress`)
  .digest("hex");
query(`
  with inserted_connection as (
    insert into public.wordpress_connections (
      organization_id, site_origin, credential_hash, plugin_version,
      wordpress_version, php_version, connected_at, last_seen_at
    )
    select
      ${sqlLiteral(organizationId)}::uuid,
      'https://demo.wyceno.local',
      decode(${sqlLiteral(wordpressCredentialHash)}, 'hex'),
      '1.4.0',
      '6.9.2',
      '8.4.0',
      now() - interval '14 days',
      now() - interval '4 minutes'
    where not exists (
      select 1
      from public.wordpress_connections
      where organization_id = ${sqlLiteral(organizationId)}::uuid
        and site_origin = 'https://demo.wyceno.local'
        and revoked_at is null
    )
    returning id
  )
  insert into public.audit_logs (
    organization_id, actor_user_id, action, target_table, target_id, metadata
  )
  select
    ${sqlLiteral(organizationId)}::uuid,
    ${sqlLiteral(userId)}::uuid,
    'demo.wordpress_connection.seeded',
    'wordpress_connections',
    id,
    '{"source":"panel_visual_qa_seed"}'::jsonb
  from inserted_connection;
`);

query(`
  with inserted_policy as (
    insert into public.organization_data_policies (
      organization_id, lead_retention_days, retention_approved_by, retention_approved_at
    )
    values (
      ${sqlLiteral(organizationId)}::uuid,
      365,
      ${sqlLiteral(userId)}::uuid,
      now()
    )
    on conflict (organization_id) do nothing
    returning organization_id
  )
  insert into public.audit_logs (
    organization_id, actor_user_id, action, target_table, target_id, metadata
  )
  select
    ${sqlLiteral(organizationId)}::uuid,
    ${sqlLiteral(userId)}::uuid,
    'demo.retention_policy.seeded',
    'organization_data_policies',
    organization_id,
    '{"lead_retention_days":365,"source":"panel_visual_qa_seed"}'::jsonb
  from inserted_policy;
`);

const leads = [
  {
    city: "Warszawa",
    email: "visualqa+anna@example.invalid",
    name: "Anna Kowalska",
    phone: "+48 600 123 456",
    score: 85,
    status: "new",
    submittedDaysAgo: 0,
  },
  {
    city: "Poznań",
    email: "visualqa+piotr@example.invalid",
    name: "Piotr Nowak",
    phone: "+48 600 234 567",
    score: 82,
    status: "in_progress",
    submittedDaysAgo: 1,
  },
  {
    city: "Gdańsk",
    email: "visualqa+katarzyna@example.invalid",
    name: "Katarzyna Wiśniewska",
    phone: "+48 600 345 678",
    score: 78,
    status: "qualified",
    submittedDaysAgo: 2,
  },
  {
    city: "Wrocław",
    email: "visualqa+michal@example.invalid",
    name: "Michał Zieliński",
    phone: "+48 600 456 789",
    score: 91,
    status: "won",
    submittedDaysAgo: 3,
  },
  {
    city: "Kraków",
    email: "visualqa+ewa@example.invalid",
    name: "Ewa Lewandowska",
    phone: "+48 600 567 890",
    score: 64,
    status: "lost",
    submittedDaysAgo: 4,
  },
  {
    city: "Łódź",
    email: "visualqa+jan@example.invalid",
    name: "Jan Wójcik",
    phone: "+48 600 678 901",
    score: 88,
    status: "qualified",
    submittedDaysAgo: 5,
  },
  {
    city: "Katowice",
    email: "visualqa+alicja@example.invalid",
    name: "Alicja Kaczmarek",
    phone: "+48 600 789 012",
    score: 81,
    status: "new",
    submittedDaysAgo: 6,
  },
  {
    city: "Szczecin",
    email: "visualqa+tomasz@example.invalid",
    name: "Tomasz Mazur",
    phone: "+48 600 890 123",
    score: 69,
    status: "in_progress",
    submittedDaysAgo: 7,
  },
  {
    city: "Lublin",
    email: "visualqa+monika@example.invalid",
    name: "Monika Dąbrowska",
    phone: "+48 600 901 234",
    score: 95,
    status: "qualified",
    submittedDaysAgo: 8,
  },
  {
    city: "Białystok",
    email: "visualqa+pawel@example.invalid",
    name: "Paweł Kamiński",
    phone: "+48 601 012 345",
    score: 86,
    status: "won",
    submittedDaysAgo: 9,
  },
  {
    city: "Rzeszów",
    email: "visualqa+zofia@example.invalid",
    name: "Zofia Król",
    phone: "+48 601 123 456",
    score: 58,
    status: "lost",
    submittedDaysAgo: 10,
  },
  {
    city: "Toruń",
    email: "visualqa+adam@example.invalid",
    name: "Adam Lis",
    phone: "+48 601 234 567",
    score: 74,
    status: "new",
    submittedDaysAgo: 11,
  },
];

const primaryServices = [
  "Kuchnia na wymiar",
  "Ogrodzenia panelowe",
  "Strona internetowa",
  "Remont mieszkania",
  "Klimatyzacja",
  "Brama przemysłowa",
  "Kuchnia na wymiar",
  "Strona internetowa",
  "Ogrodzenia i bramy",
  "Klimatyzacja",
  "Remont mieszkania",
  "Kuchnia na wymiar",
];
const primaryTimelines = [
  "W ciągu 3 miesięcy",
  "W ciągu 2 miesięcy",
  "W ciągu 1 miesiąca",
  "W ciągu 3 miesięcy",
  "W ciągu 2 miesięcy",
  "W ciągu 3 miesięcy",
  "W ciągu 3 miesięcy",
  "W ciągu 1 miesiąca",
  "W ciągu 2 miesięcy",
  "W ciągu 2 miesięcy",
  "W ciągu 3 miesięcy",
  "W ciągu 1 miesiąca",
];
leads.forEach((lead, index) => {
  lead.service = primaryServices[index];
  lead.timeline = primaryTimelines[index];
});

const supplementalNames = [
  "Joanna Szymańska",
  "Krzysztof Pawlak",
  "Magdalena Zając",
  "Łukasz Górski",
  "Natalia Witkowska",
  "Marcin Michalak",
  "Agata Jabłońska",
  "Mateusz Piotrowski",
  "Karolina Wróbel",
  "Damian Krawczyk",
  "Paulina Kaczmarczyk",
  "Robert Grabowski",
];
const supplementalScores = [76, 83, 71, 88, 79, 67, 91, 74, 82, 69, 86, 77];
const supplementalStatuses = ["new", "in_progress", "qualified", "won", "lost"];
leads.push(
  ...supplementalNames.map((name, index) => ({
    city: ["Warszawa", "Poznań", "Gdańsk", "Wrocław", "Kraków", "Łódź"][index % 6],
    email: `visualqa+uzupelnienie-${String(index + 1).padStart(2, "0")}@example.invalid`,
    name,
    phone: `+48 602 ${String(100 + index).padStart(3, "0")} ${String(200 + index).padStart(3, "0")}`,
    score: supplementalScores[index],
    service: primaryServices[index % primaryServices.length],
    status: supplementalStatuses[index % supplementalStatuses.length],
    submittedDaysAgo: 12 + (index % 6),
    timeline: primaryTimelines[index % primaryTimelines.length],
  })),
);

const additionalLeadsByDay = [3, 1, 2, 1, 2, 3, 2, 1, 2, 1, 2, 3, 1, 0, 1, 0, 0, 0];
let chartLeadIndex = 0;
for (const [day, additionalCount] of additionalLeadsByDay.entries()) {
  for (let position = 0; position < additionalCount; position += 1) {
    const demoIndex = chartLeadIndex;
    leads.push({
      city: ["Warszawa", "Poznań", "Gdańsk", "Wrocław"][demoIndex % 4],
      email: `visualqa+wykres-${String(demoIndex + 1).padStart(2, "0")}@example.invalid`,
      name: `Klient demonstracyjny ${String(demoIndex + 1).padStart(2, "0")}`,
      phone: `+48 603 ${String(100 + demoIndex).padStart(3, "0")} ${String(300 + demoIndex).padStart(3, "0")}`,
      score: [68, 74, 79, 83, 87, 92][demoIndex % 6],
      service: primaryServices[demoIndex % primaryServices.length],
      status: supplementalStatuses[demoIndex % supplementalStatuses.length],
      submittedDaysAgo: day + 0.25 + position * 0.01,
      timeline: primaryTimelines[demoIndex % primaryTimelines.length],
    });
    chartLeadIndex += 1;
  }
}

for (let index = 0; index < 39; index += 1) {
  leads.push({
    city: ["Warszawa", "Poznań", "Gdańsk", "Wrocław", "Kraków", "Łódź"][index % 6],
    completionSeconds: 216,
    email: `visualqa+poprzedni-okres-${String(index + 1).padStart(2, "0")}@example.invalid`,
    name: `Klient poprzedniego okresu ${String(index + 1).padStart(2, "0")}`,
    phone: `+48 604 ${String(100 + index).padStart(3, "0")} ${String(300 + index).padStart(3, "0")}`,
    priceMaximum: 3_930_000,
    priceMinimum: 2_930_000,
    score: [65, 72, 78, 81, 86, 90][index % 6],
    service: primaryServices[index % primaryServices.length],
    status: supplementalStatuses[index % supplementalStatuses.length],
    submittedDaysAgo: 31.5 + (index % 28),
    timeline: primaryTimelines[index % primaryTimelines.length],
  });
}

let seededLeads = 0;
for (const [index, lead] of leads.entries()) {
  const exists = query(`
    select exists(
      select 1
      from public.leads
      where organization_id = ${sqlLiteral(organizationId)}::uuid
        and contact_email = ${sqlLiteral(lead.email)}
    );
  `);
  const submittedAt = new Date(Date.now() - lead.submittedDaysAgo * 24 * 60 * 60 * 1_000);
  const submittedIso = submittedAt.toISOString();
  const category =
    lead.score >= 80
      ? { key: "high", label: "Wysokie dopasowanie" }
      : lead.score >= 55
        ? { key: "good", label: "Dobre dopasowanie" }
        : { key: "low", label: "Niskie dopasowanie" };
  const priceMinimum = lead.priceMinimum ?? 2_500_000 + (index % 6) * 250_000;
  const priceMaximum = lead.priceMaximum ?? 3_500_000 + (index % 6) * 300_000;
  const completionSeconds = lead.completionSeconds ?? 192;
  const eventNames = [
    "widget_loaded",
    "widget_opened",
    "flow_started",
    "step_viewed",
    "step_answered",
    "contact_started",
    "lead_submitted",
    "result_viewed",
  ];
  const eventOffsets = new Map(
    eventNames.map((name, eventIndex) => [
      name,
      Math.round(
        ((eventNames.length - eventIndex - 1) * completionSeconds) / (eventNames.length - 1),
      ),
    ]),
  );
  const eventOffsetCase = eventNames
    .map((name) => `when ${sqlLiteral(name)} then ${eventOffsets.get(name)}`)
    .join("\n");
  if (exists === "t") {
    query(`
      begin;
      select set_config('request.jwt.claim.sub', ${sqlLiteral(userId)}, true);

      update public.leads
      set
        submitted_at = ${sqlLiteral(submittedIso)}::timestamptz,
        score = ${lead.score},
        score_category_key = ${sqlLiteral(category.key)},
        score_category_label = ${sqlLiteral(category.label)},
        price_min_minor = ${priceMinimum},
        price_max_minor = ${priceMaximum},
        flow_title = ${sqlLiteral(lead.service ?? document.title)}
      where organization_id = ${sqlLiteral(organizationId)}::uuid
        and contact_email = ${sqlLiteral(lead.email)};

      update public.lead_answers answer_record
      set answer = ${jsonLiteral(lead.timeline ?? "W ciągu 3 miesięcy")}
      from public.leads lead_record
      where lead_record.organization_id = ${sqlLiteral(organizationId)}::uuid
        and lead_record.contact_email = ${sqlLiteral(lead.email)}
        and answer_record.organization_id = lead_record.organization_id
        and answer_record.lead_id = lead_record.id
        and answer_record.step_key = 'termin';

      update public.widget_sessions session
      set
        created_at = ${sqlLiteral(submittedIso)}::timestamptz,
        last_seen_at = ${sqlLiteral(submittedIso)}::timestamptz
      from public.leads lead_record
      where lead_record.organization_id = ${sqlLiteral(organizationId)}::uuid
        and lead_record.contact_email = ${sqlLiteral(lead.email)}
        and session.id = lead_record.session_id
        and session.organization_id = lead_record.organization_id;

      update public.session_events event
      set
        occurred_at = ${sqlLiteral(submittedIso)}::timestamptz
          - (
            case event.name
              ${eventOffsetCase}
              else 0
            end
          ) * interval '1 second',
        expires_at = ${sqlLiteral(submittedIso)}::timestamptz
          - (
            case event.name
              ${eventOffsetCase}
              else 0
            end
          ) * interval '1 second'
          + interval '90 days'
      from public.leads lead_record
      where lead_record.organization_id = ${sqlLiteral(organizationId)}::uuid
        and lead_record.contact_email = ${sqlLiteral(lead.email)}
        and event.session_id = lead_record.session_id
        and event.organization_id = lead_record.organization_id;

      commit;
    `);
    continue;
  }

  const sessionId = randomUUID();
  const leadId = randomUUID();
  const explanation = {
    pricing: {
      currency: "PLN",
      maxMinor: priceMaximum,
      minMinor: priceMinimum,
      presentation: "range",
      triggeredRules: [],
    },
    scoring: {
      category,
      score: lead.score,
      triggeredRules: [
        {
          id: "premium_scope",
          label: "Zakres usług zgodny z kompetencjami",
          points: 18,
        },
        {
          id: "known_budget",
          label: "Realny budżet i harmonogram",
          points: 12,
        },
        {
          id: "decision_maker",
          label: "Decydent zaangażowany",
          points: 10,
        },
      ],
    },
  };
  const answers = [
    ["rodzaj_zabudowy", "Jakiej zabudowy potrzebujesz?", "Kuchnia w kształcie L"],
    ["stan_projektu", "Na jakim etapie jest inwestycja?", "Mam gotowy projekt"],
    ["wymiary", "Jaka jest przybliżona długość zabudowy?", 680],
    ["standard", "Jakiego standardu oczekujesz?", "Materiały premium"],
    ["sprzety", "Czy zakres obejmuje sprzęty lub wyposażenie?", "Tak, dobór i montaż AGD"],
    ["budzet", "Jaki przedział budżetu planujesz?", "25 000–35 000 zł"],
    ["termin", "Kiedy zabudowa ma być gotowa?", lead.timeline ?? "W ciągu 3 miesięcy"],
    ["lokalizacja", "Gdzie będzie realizowana inwestycja?", lead.city],
  ];
  const answerRows = answers
    .map(
      ([stepKey, questionTitle, answer]) => `(
        gen_random_uuid(),
        ${sqlLiteral(organizationId)}::uuid,
        ${sqlLiteral(leadId)}::uuid,
        ${sqlLiteral(stepKey)},
        ${sqlLiteral(questionTitle)},
        ${jsonLiteral(answer)}
      )`,
    )
    .join(",\n");
  const historyRows = [
    `(
      gen_random_uuid(),
      ${sqlLiteral(organizationId)}::uuid,
      ${sqlLiteral(leadId)}::uuid,
      null,
      'new',
      null,
      ${sqlLiteral(submittedIso)}::timestamptz
    )`,
  ];
  if (lead.status !== "new") {
    historyRows.push(`(
      gen_random_uuid(),
      ${sqlLiteral(organizationId)}::uuid,
      ${sqlLiteral(leadId)}::uuid,
      'new',
      ${sqlLiteral(lead.status)}::public.lead_status,
      ${sqlLiteral(userId)}::uuid,
      ${sqlLiteral(new Date(submittedAt.getTime() + 60 * 60 * 1_000).toISOString())}::timestamptz
    )`);
  }
  const eventRows = eventNames
    .map((name) => {
      const occurredAt = new Date(submittedAt.getTime() - (eventOffsets.get(name) ?? 0) * 1_000);
      const stepKey = name === "step_viewed" || name === "step_answered" ? "'standard'" : "null";
      return `(
        ${sqlLiteral(randomUUID())}::uuid,
        ${sqlLiteral(organizationId)}::uuid,
        ${sqlLiteral(sessionId)}::uuid,
        ${sqlLiteral(flowId)}::uuid,
        ${sqlLiteral(versionId)}::uuid,
        1,
        ${sqlLiteral(name)}::public.analytics_event_name,
        ${sqlLiteral(occurredAt.toISOString())}::timestamptz,
        ${stepKey},
        ${sqlLiteral(index % 2 === 0 ? "organic" : "direct")}::public.analytics_source,
        ${sqlLiteral(index % 3 === 0 ? "mobile" : "desktop")}::public.analytics_device,
        ${sqlLiteral(occurredAt.toISOString())}::timestamptz + interval '90 days'
      )`;
    })
    .join(",\n");

  query(`
    begin;

    insert into public.widget_sessions (
      id, organization_id, flow_id, flow_version_id, public_flow_id,
      token_hash, status, revision, step_history, current_step_key,
      expires_at, created_at, last_seen_at
    ) values (
      ${sqlLiteral(sessionId)}::uuid,
      ${sqlLiteral(organizationId)}::uuid,
      ${sqlLiteral(flowId)}::uuid,
      ${sqlLiteral(versionId)}::uuid,
      ${sqlLiteral(publicId)}::uuid,
      decode(${sqlLiteral(randomBytes(32).toString("hex"))}, 'hex'),
      'active',
      ${document.steps.length},
      array[${document.steps.map((step) => sqlLiteral(step.key)).join(",")}],
      null,
      now() + interval '7 days',
      ${sqlLiteral(submittedIso)}::timestamptz,
      ${sqlLiteral(submittedIso)}::timestamptz
    );

    insert into public.leads (
      id, public_id, organization_id, flow_id, flow_version_id, flow_name,
      flow_title, session_id, submit_mutation_id, status, contact_email,
      contact_name, contact_phone, score, score_category_key,
      score_category_label, price_min_minor, price_max_minor, price_currency,
      price_presentation, estimation_explanation, submitted_at, updated_at
    ) values (
      ${sqlLiteral(leadId)}::uuid,
      ${sqlLiteral(randomUUID())}::uuid,
      ${sqlLiteral(organizationId)}::uuid,
      ${sqlLiteral(flowId)}::uuid,
      ${sqlLiteral(versionId)}::uuid,
      'Kwalifikacja leadów — meble na wymiar',
      ${sqlLiteral(lead.service ?? document.title)},
      ${sqlLiteral(sessionId)}::uuid,
      ${sqlLiteral(randomUUID())}::uuid,
      ${sqlLiteral(lead.status)}::public.lead_status,
      ${sqlLiteral(lead.email)},
      ${sqlLiteral(lead.name)},
      ${sqlLiteral(lead.phone)},
      ${lead.score},
      ${sqlLiteral(category.key)},
      ${sqlLiteral(category.label)},
      ${priceMinimum},
      ${priceMaximum},
      'PLN',
      'range',
      ${jsonLiteral(explanation)},
      ${sqlLiteral(submittedIso)}::timestamptz,
      ${sqlLiteral(submittedIso)}::timestamptz
    );

    insert into public.lead_answers (
      id, organization_id, lead_id, step_key, question_title, answer
    ) values ${answerRows};

    insert into public.lead_status_history (
      id, organization_id, lead_id, from_status, to_status, changed_by, changed_at
    ) values ${historyRows.join(",\n")};

    insert into public.consent_records (
      id, organization_id, lead_id, type, accepted, content_version,
      content_hash, source, recorded_at
    ) values (
      gen_random_uuid(),
      ${sqlLiteral(organizationId)}::uuid,
      ${sqlLiteral(leadId)}::uuid,
      'privacy_notice',
      true,
      'panel-visual-qa-v1',
      ${sqlLiteral(privacyHash)},
      'widget',
      ${sqlLiteral(submittedIso)}::timestamptz
    );

    ${
      index === 0
        ? `
          insert into public.lead_notes (
            id, organization_id, lead_id, body, created_by, created_at
          ) values (
            gen_random_uuid(),
            ${sqlLiteral(organizationId)}::uuid,
            ${sqlLiteral(leadId)}::uuid,
            'Klientowi zależy na terminie i spójnym projekcie całej zabudowy.',
            ${sqlLiteral(userId)}::uuid,
            ${sqlLiteral(
              new Date(submittedAt.getTime() + 30 * 60 * 1_000).toISOString(),
            )}::timestamptz
          );

          insert into public.notifications (
            id, organization_id, lead_id, kind, recipient_email,
            template_version, status, attempt_count, sent_at, provider,
            provider_message_id
          ) values
          (
            gen_random_uuid(),
            ${sqlLiteral(organizationId)}::uuid,
            ${sqlLiteral(leadId)}::uuid,
            'lead_customer_confirmation',
            ${sqlLiteral(lead.email)},
            'lead-customer-v1',
            'sent',
            1,
            ${sqlLiteral(
              new Date(submittedAt.getTime() + 2 * 60 * 1_000).toISOString(),
            )}::timestamptz,
            'test',
            ${sqlLiteral(`visual-qa-customer-${leadId}`)}
          ),
          (
            gen_random_uuid(),
            ${sqlLiteral(organizationId)}::uuid,
            ${sqlLiteral(leadId)}::uuid,
            'lead_company_alert',
            'visualqa-company@example.invalid',
            'lead-company-v1',
            'sent',
            1,
            ${sqlLiteral(
              new Date(submittedAt.getTime() + 3 * 60 * 1_000).toISOString(),
            )}::timestamptz,
            'test',
            ${sqlLiteral(`visual-qa-company-${leadId}`)}
          );
        `
        : ""
    }

    insert into public.session_events (
      id, organization_id, session_id, flow_id, flow_version_id,
      schema_version, name, occurred_at, step_key, source, device, expires_at
    ) values ${eventRows};

    commit;
  `);
  seededLeads += 1;
}

const previousExtraSessionId = stableUuid(`${organizationId}:panel-visual-qa:previous-session`);
const previousExtraLoadedEventId = stableUuid(
  `${organizationId}:panel-visual-qa:previous-session:loaded`,
);
const previousExtraOpenedEventId = stableUuid(
  `${organizationId}:panel-visual-qa:previous-session:opened`,
);
const previousExtraLoadedAt = new Date(Date.now() - 45 * 24 * 60 * 60 * 1_000);
const previousExtraOpenedAt = new Date(previousExtraLoadedAt.getTime() + 24_000);
query(`
  begin;

  insert into public.widget_sessions (
    id, organization_id, flow_id, flow_version_id, public_flow_id,
    token_hash, status, revision, step_history, current_step_key,
    expires_at, created_at, last_seen_at
  ) values (
    ${sqlLiteral(previousExtraSessionId)}::uuid,
    ${sqlLiteral(organizationId)}::uuid,
    ${sqlLiteral(flowId)}::uuid,
    ${sqlLiteral(versionId)}::uuid,
    ${sqlLiteral(publicId)}::uuid,
    decode(${sqlLiteral(createHash("sha256").update(previousExtraSessionId).digest("hex"))}, 'hex'),
    'active',
    0,
    array[]::text[],
    null,
    now() + interval '7 days',
    ${sqlLiteral(previousExtraLoadedAt.toISOString())}::timestamptz,
    ${sqlLiteral(previousExtraOpenedAt.toISOString())}::timestamptz
  )
  on conflict (id) do update
  set
    created_at = excluded.created_at,
    last_seen_at = excluded.last_seen_at;

  insert into public.session_events (
    id, organization_id, session_id, flow_id, flow_version_id,
    schema_version, name, occurred_at, step_key, source, device, expires_at
  ) values
  (
    ${sqlLiteral(previousExtraLoadedEventId)}::uuid,
    ${sqlLiteral(organizationId)}::uuid,
    ${sqlLiteral(previousExtraSessionId)}::uuid,
    ${sqlLiteral(flowId)}::uuid,
    ${sqlLiteral(versionId)}::uuid,
    1,
    'widget_loaded',
    ${sqlLiteral(previousExtraLoadedAt.toISOString())}::timestamptz,
    null,
    'direct',
    'desktop',
    ${sqlLiteral(previousExtraLoadedAt.toISOString())}::timestamptz + interval '90 days'
  ),
  (
    ${sqlLiteral(previousExtraOpenedEventId)}::uuid,
    ${sqlLiteral(organizationId)}::uuid,
    ${sqlLiteral(previousExtraSessionId)}::uuid,
    ${sqlLiteral(flowId)}::uuid,
    ${sqlLiteral(versionId)}::uuid,
    1,
    'widget_opened',
    ${sqlLiteral(previousExtraOpenedAt.toISOString())}::timestamptz,
    null,
    'direct',
    'desktop',
    ${sqlLiteral(previousExtraOpenedAt.toISOString())}::timestamptz + interval '90 days'
  )
  on conflict (id) do update
  set
    occurred_at = excluded.occurred_at,
    expires_at = excluded.expires_at;

  commit;
`);

let seededAttachment = false;
if (supabaseUrl && serviceRoleKey) {
  const firstLead = query(`
    select concat(id::text, '|', session_id::text)
    from public.leads
    where organization_id = ${sqlLiteral(organizationId)}::uuid
      and contact_email = 'visualqa+anna@example.invalid'
    limit 1;
  `);
  const [attachmentLeadId, attachmentSessionId] = firstLead.split("|");
  if (!attachmentLeadId || !attachmentSessionId) {
    throw new Error("Brak demonstracyjnego leada dla załącznika.");
  }
  const storage = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const demoAttachments = [
    {
      fileName: "inspiracja-kuchni.webp",
      source: "../public/images/redesign/hero-kitchen-diptych-v1.webp",
    },
    {
      fileName: "inspiracja-materialow.webp",
      source: "../public/images/redesign/industry-template-sprite-v1.webp",
    },
    {
      fileName: "szkic-funkcjonalny.webp",
      source: "../public/images/redesign/inquiry-to-brief-line-illustration.webp",
    },
  ];
  for (const attachment of demoAttachments) {
    const attachmentBytes = await readFile(new URL(attachment.source, import.meta.url));
    const objectPath = `${organizationId}/${attachmentSessionId}/panel-visual-qa/${attachment.fileName}`;
    const attachmentExists =
      query(`
        select exists(
          select 1
          from public.lead_files
          where organization_id = ${sqlLiteral(organizationId)}::uuid
            and object_path = ${sqlLiteral(objectPath)}
        );
      `) === "t";
    const { error: uploadError } = await storage.storage
      .from("tenant-private")
      .upload(objectPath, attachmentBytes, {
        contentType: "image/webp",
        upsert: true,
      });
    if (uploadError) {
      throw new Error(`Nie udało się zapisać załącznika visual QA: ${uploadError.message}`);
    }
    query(`
      insert into public.lead_files (
        organization_id, session_id, lead_id, object_path, original_name,
        mime_type, size_bytes, sha256, status, verified_at
      )
      values (
        ${sqlLiteral(organizationId)}::uuid,
        ${sqlLiteral(attachmentSessionId)}::uuid,
        ${sqlLiteral(attachmentLeadId)}::uuid,
        ${sqlLiteral(objectPath)},
        ${sqlLiteral(attachment.fileName)},
        'image/webp',
        ${attachmentBytes.byteLength},
        ${sqlLiteral(createHash("sha256").update(attachmentBytes).digest("hex"))},
        'verified',
        now()
      )
      on conflict (object_path) do nothing;
    `);
    seededAttachment ||= !attachmentExists;
  }
}

console.log(
  JSON.stringify({
    demoEmail: "visualqa-20260727@wyceno.local",
    editorFlowId,
    flowId,
    organizationId,
    publicId,
    seededAttachment,
    seededLeads,
  }),
);
