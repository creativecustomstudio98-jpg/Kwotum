import { existsSync } from "node:fs";
import { cp, mkdir, readdir, readFile, rm } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const widgetDist = new URL("../../../packages/widget/dist/", import.meta.url);
const widgetCss = new URL("../../../packages/ui/src/widget.css", import.meta.url);
const publicTarget = new URL("../public/widget/v1/", import.meta.url);

if (!existsSync(widgetDist)) {
  throw new Error("Widget package is not built. Run the workspace build through Turborepo.");
}

await rm(publicTarget, { force: true, recursive: true });
await mkdir(publicTarget, { recursive: true });
await cp(widgetDist, publicTarget, { recursive: true });
await cp(widgetCss, new URL("widget.css", publicTarget));

async function javascriptFiles(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryUrl = new URL(entry.name, directory);
    if (entry.isDirectory()) {
      found.push(...(await javascriptFiles(new URL(`${entry.name}/`, directory))));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      found.push(entryUrl);
    }
  }
  return found;
}

let gzipBytes = 0;
for (const file of await javascriptFiles(publicTarget)) {
  gzipBytes += gzipSync(await readFile(file)).byteLength;
}

const budgetBytes = 90 * 1024;
if (gzipBytes > budgetBytes) {
  throw new Error(`Widget exceeds the 90 KiB gzip budget: ${gzipBytes} bytes.`);
}

console.log(`Widget JavaScript: ${gzipBytes} bytes gzip (budget ${budgetBytes}).`);
