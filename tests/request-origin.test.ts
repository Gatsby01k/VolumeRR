import test from "node:test";
import assert from "node:assert/strict";
import { isSameOriginRequest } from "../lib/server/request-origin";

test("Same-origin forms respect the public Host after Next.js normalizes the internal hostname", () => {
  const check = (origin: string, host = "127.0.0.1:3003") =>
    isSameOriginRequest(
      new Request("http://localhost:3003/api/enquiries", {
        headers: { Origin: origin, Host: host },
      }),
    );
  assert.equal(check("http://127.0.0.1:3003"), true);
  assert.equal(check("http://localhost:3003", "localhost:3003"), true);
  assert.equal(check("https://other.example"), false);
  assert.equal(check("http://127.0.0.1:3004"), false);
  assert.equal(check("https://127.0.0.1:3003"), false);
  assert.equal(check("null"), false);
  assert.equal(
    check("http://127.0.0.1:3003", "127.0.0.1:3003@other.example"),
    false,
  );
  assert.equal(
    isSameOriginRequest(new Request("http://localhost:3003/api/enquiries")),
    false,
  );
});
