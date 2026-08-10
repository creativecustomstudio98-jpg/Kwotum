const baseUrl = new URL(process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3100");
const deploymentEnv = process.env.SMOKE_DEPLOYMENT_ENV ?? "local";
const timeoutMs = 5_000;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path) {
  return fetch(new URL(path, baseUrl), {
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.timeout(timeoutMs),
  });
}

function assertSecurityHeaders(response, label) {
  assert(response.headers.get("content-security-policy"), `${label}: missing CSP`);
  assert(response.headers.get("x-content-type-options") === "nosniff", `${label}: missing nosniff`);
  assert(response.headers.get("x-frame-options") === "DENY", `${label}: missing frame deny`);
  assert(
    response.headers.get("access-control-allow-origin") === null,
    `${label}: unexpected cross-origin access`,
  );
}

const health = await request("/health");
assert(health.status === 200, `health: expected 200, received ${health.status}`);
assertSecurityHeaders(health, "health");
assert(health.headers.get("cache-control") === "no-store", "health: response is cacheable");
assert(health.headers.get("set-cookie") === null, "health: unexpected cookie");
assert(health.headers.get("x-robots-tag") === "noindex, nofollow", "health: indexable");
const healthPayload = await health.json();
assert(healthPayload?.status === "ok", "health: unexpected payload");

const ready = await request("/ready");
assert(ready.status === 200, `ready: expected 200, received ${ready.status}`);
assertSecurityHeaders(ready, "ready");
assert(ready.headers.get("cache-control") === "no-store", "ready: response is cacheable");
assert(ready.headers.get("set-cookie") === null, "ready: unexpected cookie");
assert(ready.headers.get("x-robots-tag") === "noindex, nofollow", "ready: indexable");
const readyPayload = await ready.json();
assert(readyPayload?.status === "ready", "ready: dependency is unavailable");

const robots = await request("/robots.txt");
assert(robots.status === 200, `robots: expected 200, received ${robots.status}`);
const robotsBody = await robots.text();
assert(robotsBody.includes("Disallow: /design-system"), "robots: design-system is not blocked");
assert(robotsBody.includes("Disallow: /panel"), "robots: panel is not blocked");

const designSystem = await request("/design-system");
const privateRuntime = deploymentEnv === "staging" || deploymentEnv === "production";
if (privateRuntime) {
  assert(
    designSystem.status === 404,
    `design-system: expected 404, received ${designSystem.status}`,
  );
} else {
  assert(
    designSystem.status === 200,
    `design-system: expected 200, received ${designSystem.status}`,
  );
  const designSystemBody = await designSystem.text();
  assert(
    designSystemBody.includes('name="robots" content="noindex, nofollow"'),
    "design-system: missing noindex metadata",
  );
}

console.log(
  JSON.stringify({
    baseUrl: baseUrl.origin,
    checks: ["health", "ready", "security-headers", "cors", "robots", "design-system"],
    deploymentEnv,
    status: "passed",
  }),
);
