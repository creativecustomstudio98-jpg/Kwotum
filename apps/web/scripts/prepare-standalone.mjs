import { existsSync } from "node:fs";
import { cp, mkdir, readdir } from "node:fs/promises";

const standaloneRoot = new URL("../.next/standalone/apps/web/", import.meta.url);
const repositoryPnpmRoot = new URL("../../../node_modules/.pnpm/", import.meta.url);
const standalonePnpmRoot = new URL("../.next/standalone/node_modules/.pnpm/", import.meta.url);
const copies = [
  {
    source: new URL("../.next/static/", import.meta.url),
    target: new URL(".next/static/", standaloneRoot),
  },
  {
    source: new URL("../public/", import.meta.url),
    target: new URL("public/", standaloneRoot),
  },
];

if (existsSync(repositoryPnpmRoot) && existsSync(standalonePnpmRoot)) {
  const standalonePackages = new Set(await readdir(standalonePnpmRoot));
  const repositoryPackages = await readdir(repositoryPnpmRoot);

  for (const directory of repositoryPackages) {
    const runtimePackage = directory.match(/^@img\+(sharp-libvips-.+)@[^@]+$/)?.[1];
    if (!runtimePackage || !standalonePackages.has(directory)) continue;

    copies.push({
      source: new URL(`${directory}/node_modules/@img/${runtimePackage}/`, repositoryPnpmRoot),
      target: new URL(`${directory}/node_modules/@img/${runtimePackage}/`, standalonePnpmRoot),
    });
  }
}

await mkdir(standaloneRoot, { recursive: true });

for (const { source, target } of copies) {
  if (existsSync(source)) {
    await cp(source, target, { force: true, recursive: true });
  }
}
