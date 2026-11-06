import { writeFileSync } from "node:fs";
import { routes } from "../lib/content";

async function main() {
  const base = process.env.SMOKE_URL || "http://127.0.0.1:3000";
  const results: { path: string; status: number; h1: number; ok: boolean }[] =
    [];
  for (const route of routes) {
    if (route.path.includes("[")) continue;
    const response = await fetch(base + route.path, { redirect: "manual" });
    const html = await response.text();
    const h1 = (html.match(/<h1(?:\s|>)/g) || []).length;
    const expected =
      route.readiness === "reserved" || route.id === "not_found" ? 404 : 200;
    results.push({
      path: route.path,
      status: response.status,
      h1,
      ok:
        response.status === expected &&
        (expected === 404 ? html.includes("Find your flow.") : h1 === 1) &&
        !html.includes("Internal Server Error"),
    });
  }
  for (const path of [
    "/contact/basic",
    "/this-route-does-not-exist",
    "/api/receipt",
    "/robots.txt",
    "/sitemap.xml",
  ]) {
    const r = await fetch(base + path);
    results.push({
      path,
      status: r.status,
      h1: 0,
      ok:
        r.status ===
        (["/this-route-does-not-exist", "/api/receipt"].includes(path)
          ? 404
          : 200),
    });
  }
  writeFileSync(
    "docs/http-verification.json",
    JSON.stringify(
      { base, checkedAt: new Date().toISOString(), results },
      null,
      2,
    ),
  );
  const failed = results.filter((r) => !r.ok);
  console.log(
    `${results.length - failed.length}/${results.length} HTTP route checks passed.`,
  );
  if (failed.length) {
    console.error(failed);
    process.exitCode = 1;
  }
}
void main();
