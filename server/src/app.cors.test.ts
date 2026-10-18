import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";

const approvedOrigins = [
  "https://photography-platform-eta.vercel.app",
  "https://malumeph.com",
];

process.env.NODE_ENV = "test";
process.env.CLIENT_ORIGIN = `${approvedOrigins[0]}, , ${approvedOrigins[1]},`;

let server: Server;
let baseUrl: string;

before(async () => {
  const { createApp } = await import("./app.js");
  server = createApp(async () => ({
    ok: true,
    services: { postgres: { ok: true }, redis: { ok: true } },
  })).listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server?.listening) {
    server.close();
    await once(server, "close");
  }
});

async function request(path: string, init?: RequestInit) {
  return fetch(`${baseUrl}${path}`, init);
}

describe("production CORS allowlist", () => {
  for (const origin of approvedOrigins) {
    it(`allows ${origin} on a successful API response`, async () => {
      const response = await request("/health", {
        headers: { Origin: origin },
      });

      assert.equal(response.status, 200);
      assert.equal(response.headers.get("access-control-allow-origin"), origin);
      assert.equal(
        response.headers.get("access-control-allow-credentials"),
        "true",
      );
    });

    it(`allows ${origin} with credentials on application errors`, async () => {
      const response = await request("/cors-test-missing-route", {
        headers: { Origin: origin },
      });

      assert.equal(response.status, 404);
      assert.equal(response.headers.get("access-control-allow-origin"), origin);
      assert.equal(
        response.headers.get("access-control-allow-credentials"),
        "true",
      );
      assert.match(response.headers.get("vary") ?? "", /\bOrigin\b/i);
    });

    it(`handles OPTIONS preflight for ${origin}`, async () => {
      const response = await request("/portfolio", {
        method: "OPTIONS",
        headers: {
          Origin: origin,
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "content-type,authorization",
        },
      });

      assert.equal(response.status, 204);
      assert.equal(response.headers.get("access-control-allow-origin"), origin);
      assert.equal(
        response.headers.get("access-control-allow-credentials"),
        "true",
      );
      assert.match(
        response.headers.get("access-control-allow-methods") ?? "",
        /\bPOST\b/,
      );
      assert.equal(
        response.headers.get("access-control-allow-headers"),
        "content-type,authorization",
      );
      assert.match(response.headers.get("vary") ?? "", /\bOrigin\b/i);
    });
  }

  it("does not grant CORS permission to an unapproved origin", async () => {
    const response = await request("/cors-test-missing-route", {
      headers: { Origin: "https://unapproved.example" },
    });

    assert.equal(response.status, 404);
    assert.equal(response.headers.get("access-control-allow-origin"), null);
    assert.notEqual(response.headers.get("access-control-allow-origin"), "*");
  });

  it("does not authorize an unapproved OPTIONS preflight", async () => {
    const response = await request("/portfolio", {
      method: "OPTIONS",
      headers: {
        Origin: "https://unapproved.example",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });

    assert.equal(response.headers.get("access-control-allow-origin"), null);
    assert.notEqual(response.headers.get("access-control-allow-origin"), "*");
  });

  it("retains CORS headers on unexpected parser errors", async () => {
    const response = await request("/quotes", {
      method: "POST",
      headers: {
        Origin: approvedOrigins[1],
        "Content-Type": "application/json",
      },
      body: "{invalid-json",
    });

    assert.equal(response.status, 500);
    assert.equal(
      response.headers.get("access-control-allow-origin"),
      approvedOrigins[1],
    );
    assert.equal(
      response.headers.get("access-control-allow-credentials"),
      "true",
    );
  });
});
