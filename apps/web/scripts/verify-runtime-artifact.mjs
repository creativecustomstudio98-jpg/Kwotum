import { readFile, readdir } from "node:fs/promises";

const webRoot = new URL("../", import.meta.url);
const routeTraceUrl = new URL(
  ".next/server/app/api/v1/organizations/[organizationId]/flow-assets/route.js.nft.json",
  webRoot,
);
const panelTraceUrls = [
  new URL(".next/server/app/panel/[organizationId]/procesy/[flowId]/page.js.nft.json", webRoot),
  new URL(".next/server/app/panel/[organizationId]/ustawienia/page.js.nft.json", webRoot),
];

function assertArtifact(condition, message) {
  if (!condition) throw new Error(`[runtime-artifact] ${message}`);
}

async function readTrace(url) {
  const trace = JSON.parse(await readFile(url, "utf8"));
  assertArtifact(Array.isArray(trace.files), `Nieprawidłowy trace: ${url.pathname}`);
  return trace.files.map((file) => file.replaceAll("\\", "/"));
}

const platform = `${process.platform}-${process.arch}`;
assertArtifact(
  ["darwin-arm64", "darwin-x64", "linux-arm64", "linux-x64"].includes(platform),
  `Nieobsługiwana platforma gate'u: ${platform}`,
);

const uploadTrace = await readTrace(routeTraceUrl);
assertArtifact(
  uploadTrace.some((file) => file.includes(`/sharp-${platform}-`) && file.endsWith(".node")),
  `Trace uploadu nie zawiera natywnego bindingu sharp dla ${platform}.`,
);
assertArtifact(
  uploadTrace.some(
    (file) => file.includes(`/sharp-libvips-${platform}/`) && file.includes("/lib/libvips-cpp."),
  ),
  `Trace uploadu nie zawiera biblioteki libvips dla ${platform}.`,
);

for (const panelTraceUrl of panelTraceUrls) {
  const panelTrace = await readTrace(panelTraceUrl);
  assertArtifact(
    panelTrace.every((file) => !/sharp|libvips/u.test(file)),
    `Trasa tylko do odczytu ładuje sharp: ${panelTraceUrl.pathname}`,
  );
}

const standaloneAliasesUrl = new URL(".next/standalone/apps/web/.next/node_modules/", webRoot);
const sharpAliases = (await readdir(standaloneAliasesUrl)).filter((name) =>
  name.startsWith("sharp-"),
);
assertArtifact(
  sharpAliases.length === 1,
  `Artefakt standalone powinien zawierać jeden alias sharp, znaleziono: ${sharpAliases.length}.`,
);
const sharpEntry = new URL(`${sharpAliases[0]}/dist/index.mjs`, standaloneAliasesUrl);
const { default: sharp } = await import(sharpEntry.href);
const probe = await sharp({
  create: { background: "#0b6048", channels: 3, height: 2, width: 2 },
})
  .webp()
  .toBuffer();
assertArtifact(probe.byteLength > 0, "Sharp nie przetworzył obrazu w artefakcie standalone.");

console.log(`[runtime-artifact] PASS (${platform}, ${uploadTrace.length} plików w trace uploadu).`);
