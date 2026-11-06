import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { countries, methods, products, routes, pages } from "../lib/content";
import navigation from "../content/navigation.json";
import ui from "../content/ui.en.json";
import copy from "../content/content.en.json";
import sourceRoutes from "../content/route-paths.json";

assert.equal(routes.length, 42);
assert.equal(
  new Set(routes.map((r) => r.path)).size,
  routes.length,
  "Routes must be unique",
);
assert.deepEqual(
  ui,
  copy.global,
  "The client UI copy must match the canonical content",
);
assert.deepEqual(
  sourceRoutes,
  routes.filter((r) => r.readiness !== "reserved").map((r) => r.path),
  "The client route allowlist must match the route manifest",
);
for (const route of routes) {
  assert(pages[route.id], `Missing copy: ${route.id}`);
  assert.equal(pages[route.id].path, route.path);
  assert(route.meta.title && route.meta.description);
  if (route.readiness === "reserved")
    assert(!route.navigation && route.indexing === "noindex");
}
for (const c of countries) {
  assert(/^[A-Z]{2}$/.test(c.iso2));
  assert(Intl.supportedValuesOf("currency").includes(c.currency));
  for (const id of c.methodIds)
    assert(
      methods.some((m) => m.id === id),
      `Unknown method ${id}`,
    );
  for (const a of c.availability) {
    assert(products.some((p) => p.id === a.flowId));
    if (a.state === "available") assert(a.reviewedAt && a.evidenceIds.length);
  }
}
for (const item of navigation.items)
  for (const child of [
    item,
    ...("children" in item ? item.children || [] : []),
  ])
    assert(
      routes.some((r) => r.path === child.href && r.readiness !== "reserved"),
      `Invalid nav ${child.href}`,
    );
for (const path of [
  "public/brand/wordmark.webp",
  "public/brand/manta.webp",
  "public/fonts/Manrope.variable.woff2",
  "public/fonts/Unbounded.variable.woff2",
])
  assert(existsSync(path), `Missing ${path}`);
console.log(
  `Content validated: ${routes.length} route contracts, ${routes.filter((r) => r.readiness !== "reserved").length} implemented routes, ${countries.length} markets, ${products.length} products, ${methods.length} method references.`,
);
