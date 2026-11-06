import { gzipSync } from "node:zlib";
import { writeFileSync } from "node:fs";

async function main() {
  const origin = process.env.SMOKE_URL || "http://127.0.0.1:3000";
  const html = await (await fetch(origin)).text();
  const tags = [...html.matchAll(/<(?:script|link)\b[^>]*>/g)].map(
    (match) => match[0],
  );
  const assets = new Map<string, boolean>();
  for (const tag of tags) {
    const path = tag.match(
      /(?:src|href)="([^" ]+\.(?:js|css)(?:\?[^" ]*)?)"/,
    )?.[1];
    if (path) assets.set(path, /\bnoModule\b|\bnomodule\b/.test(tag));
  }
  const sizes: { path: string; legacyOnly: boolean; bytes: number; gzip: number }[] = [];
  for (const [path, legacyOnly] of assets) {
    const response = await fetch(new URL(path, origin));
    if (!response.ok) throw new Error(`Missing asset ${path}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    sizes.push({
      path,
      legacyOnly,
      bytes: bytes.length,
      gzip: gzipSync(bytes).length,
    });
  }
  const sum = (type: string, modernOnly = false) =>
    sizes
      .filter(
        (asset) =>
          new URL(asset.path, origin).pathname.endsWith("." + type) &&
          (!modernOnly || !asset.legacyOnly),
      )
      .reduce((total, asset) => total + asset.gzip, 0);
  const report = {
    checkedAt: new Date().toISOString(),
    origin,
    methodology:
      "Production HTML script and CSS resources fetched locally and gzip-compressed. Modern JS excludes the nomodule legacy polyfill. This is an asset-weight audit, not a field Core Web Vitals measurement.",
    allJsGzipBytes: sum("js"),
    modernJsGzipBytes: sum("js", true),
    cssGzipBytes: sum("css"),
    heroPosterBytes: 28302,
    budgets: { initialJsGzipBytes: 130 * 1024, cssGzipBytes: 40 * 1024 },
    assets: sizes,
  };
  writeFileSync(
    "docs/asset-verification.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log({
    modernJsGzipKB: (report.modernJsGzipBytes / 1024).toFixed(1),
    cssGzipKB: (report.cssGzipBytes / 1024).toFixed(1),
    initialJsBudgetMet:
      report.modernJsGzipBytes <= report.budgets.initialJsGzipBytes,
  });
}
void main();
