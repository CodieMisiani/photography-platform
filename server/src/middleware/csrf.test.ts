import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";

const allowedOrigin = "https://malumeph.com";

process.env.NODE_ENV = "test";
process.env.CLIENT_ORIGIN = allowedOrigin;
process.env.SESSION_COOKIE_NAME = "studio_admin_session";

let server: Server;
let baseUrl: string;
let sessions: Map<
  string,
  { email: string; createdAt: string; csrfToken: string }
>;
let destroyedSessions: string[];
let nextSessionNumber: number;

before(async () => {
  const [
    { createAuthHandlers },
    { createRequireAdminSession, createRequireAllowedOrigin },
    { default: express },
    { default: cors },
    { default: cookieParser },
  ] = await Promise.all([
    import("../controllers/authController.js"),
    import("./auth.js"),
    import("express"),
    import("cors"),
    import("cookie-parser"),
  ]);

  sessions = new Map();
  destroyedSessions = [];
  nextSessionNumber = 0;
  const auth = createAuthHandlers({
    verifyCredentials: async (email) => ({ email }),
    createSession: async (email) => {
      const sessionNumber = nextSessionNumber++;
      const sessionId = `test-session-id-${sessionNumber}`;
      const csrfToken = sessionNumber.toString(16).padStart(64, "0");
      sessions.set(sessionId, {
        email,
        createdAt: new Date().toISOString(),
        csrfToken,
      });
      return { sessionId, csrfToken };
    },
    destroySession: async (sessionId) => {
      destroyedSessions.push(sessionId);
      sessions.delete(sessionId);
    },
    getSession: async (sessionId) => sessions.get(sessionId) ?? null,
    cookieName: "studio_admin_session",
    cookieOptions: {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 8 * 60 * 60 * 1000,
      path: "/",
    },
  });

  const app = express();
  app.use(cors({ origin: [allowedOrigin], credentials: true }));
  app.use(express.json());
  app.use(cookieParser("test-session-secret"));
  app.post(
    "/auth/login",
    createRequireAllowedOrigin([allowedOrigin]),
    auth.login,
  );
  app.get("/auth/me", auth.me);
  app.post(
    "/auth/logout",
    createRequireAdminSession(
      async (id) => sessions.get(id) ?? null,
      [allowedOrigin],
    ),
    auth.logout,
  );
  app.post(
    "/admin/mutation",
    createRequireAdminSession(
      async (id) => sessions.get(id) ?? null,
      [allowedOrigin],
    ),
    (_req, res) => res.status(200).json({ ok: true }),
  );
  app.post(
    "/portfolio/:id/photos",
    createRequireAdminSession(
      async (id) => sessions.get(id) ?? null,
      [allowedOrigin],
    ),
    (_req, res) => res.status(201).json({ ok: true }),
  );
  app.get(
    "/admin/read",
    createRequireAdminSession(
      async (id) => sessions.get(id) ?? null,
      [allowedOrigin],
    ),
    (_req, res) => res.status(200).json({ ok: true }),
  );
  app.post("/newsletter/subscribe", (_req, res) =>
    res.status(201).json({ ok: true }),
  );
  app.post("/webhooks/daraja", (_req, res) =>
    res.status(200).json({ ok: true }),
  );
  app.use(
    (
      error: unknown,
      _req: unknown,
      res: {
        status: (code: number) => { json: (body: unknown) => void };
      },
      _next: unknown,
    ) => {
      const appError = error as {
        statusCode?: number;
        code?: string;
        message?: string;
      };
      res.status(appError.statusCode ?? 500).json({
        error: {
          code: appError.code ?? "INTERNAL_SERVER_ERROR",
          message: appError.message ?? "Something went wrong",
        },
      });
    },
  );

  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  if (server?.listening) {
    server.close();
    await once(server, "close");
  }
});

async function request(path: string, init: RequestInit = {}) {
  return fetch(`${baseUrl}${path}`, init);
}

async function loginAndGetCookie() {
  const response = await request("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: allowedOrigin,
    },
    body: JSON.stringify({ email: "admin@example.test", password: "password" }),
  });
  const cookie = response.headers.get("set-cookie")?.split(";")[0];
  const body = (await response.json()) as { csrfToken: string };
  return { response, cookie, csrfToken: body.csrfToken, body };
}

describe("session-bound admin CSRF protection", () => {
  it("issues a no-store synchronizer token at login and restores it from the session", async () => {
    const { response, cookie, body: loginBody } = await loginAndGetCookie();
    const loginData = loginBody as {
      admin: { email: string };
      csrfToken: string;
    };

    assert.equal(response.status, 200);
    assert.equal(loginData.admin.email, "admin@example.test");
    assert.match(loginData.csrfToken, /^[a-f\d]{64}$/i);
    assert.match(response.headers.get("cache-control") ?? "", /no-store/i);
    assert.ok(cookie);

    const restored = await request("/auth/me", {
      headers: { Cookie: cookie, Origin: allowedOrigin },
    });
    const restoredBody = (await restored.json()) as {
      admin: { email: string };
      csrfToken: string;
    };

    assert.equal(restored.status, 200);
    assert.equal(restoredBody.admin.email, "admin@example.test");
    assert.equal(restoredBody.csrfToken, loginData.csrfToken);
    assert.match(restored.headers.get("cache-control") ?? "", /no-store/i);
  });

  it("accepts a protected mutation with the approved origin and valid session token", async () => {
    const { cookie, csrfToken } = await loginAndGetCookie();
    const response = await request("/admin/mutation", {
      method: "POST",
      headers: {
        Cookie: cookie!,
        Origin: allowedOrigin,
        "X-CSRF-Token": csrfToken,
      },
    });

    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get("access-control-allow-origin"),
      allowedOrigin,
    );
    assert.equal(
      response.headers.get("access-control-allow-credentials"),
      "true",
    );
  });

  it("rejects a missing or invalid CSRF token", async () => {
    const { cookie, csrfToken } = await loginAndGetCookie();
    for (const token of [undefined, "invalid-token"]) {
      const headers = new Headers({ Cookie: cookie!, Origin: allowedOrigin });
      if (token) headers.set("X-CSRF-Token", token);
      const response = await request("/admin/mutation", {
        method: "POST",
        headers,
      });
      const body = (await response.json()) as {
        error: { code: string; message: string };
      };
      assert.equal(response.status, 403);
      assert.equal(body.error.code, "CSRF_TOKEN_INVALID");
      assert.equal(JSON.stringify(body).includes(cookie!), false);
      assert.equal(JSON.stringify(body).includes(csrfToken), false);
    }
  });

  it("rejects an unapproved origin even when the session token is valid", async () => {
    const { cookie, csrfToken } = await loginAndGetCookie();
    const response = await request("/admin/mutation", {
      method: "POST",
      headers: {
        Cookie: cookie!,
        Origin: "https://unapproved.example",
        "X-CSRF-Token": csrfToken,
      },
    });
    const body = (await response.json()) as { error: { code: string } };

    assert.equal(response.status, 403);
    assert.equal(body.error.code, "CSRF_ORIGIN_INVALID");
    assert.equal(response.headers.get("access-control-allow-origin"), null);
  });

  it("rejects a token issued to a different session", async () => {
    const first = await loginAndGetCookie();
    const second = await loginAndGetCookie();
    assert.notEqual(first.csrfToken, second.csrfToken);
    const response = await request("/admin/mutation", {
      method: "POST",
      headers: {
        Cookie: first.cookie!,
        Origin: allowedOrigin,
        "X-CSRF-Token": second.csrfToken,
      },
    });
    assert.equal(response.status, 403);
  });

  it("rejects a missing, null, malformed, or disallowed Origin", async () => {
    const { cookie, csrfToken } = await loginAndGetCookie();
    for (const origin of [
      undefined,
      "null",
      "https://malumeph.com/path",
      "https://unapproved.example",
    ]) {
      const headers = new Headers({ Cookie: cookie!, "X-CSRF-Token": csrfToken });
      if (origin !== undefined) headers.set("Origin", origin);
      const response = await request("/admin/mutation", {
        method: "POST",
        headers,
      });
      assert.equal(response.status, 403);
    }
  });

  it("rejects login attempts from an unapproved origin", async () => {
    const response = await request("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://unapproved.example",
      },
      body: JSON.stringify({
        email: "admin@example.test",
        password: "password",
      }),
    });
    const body = (await response.json()) as { error: { code: string } };

    assert.equal(response.status, 403);
    assert.equal(body.error.code, "CSRF_ORIGIN_INVALID");
  });

  it("allows safe methods without a CSRF token and preflight without session auth", async () => {
    const { cookie } = await loginAndGetCookie();
    const read = await request("/admin/read", {
      headers: { Cookie: cookie!, Origin: allowedOrigin },
    });
    const preflight = await request("/admin/mutation", {
      method: "OPTIONS",
      headers: {
        Origin: allowedOrigin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "x-csrf-token",
      },
    });

    assert.equal(read.status, 200);
    const head = await request("/admin/read", {
      method: "HEAD",
      headers: { Cookie: cookie!, Origin: allowedOrigin },
    });
    assert.equal(head.status, 200);
    assert.equal(preflight.status, 204);
    assert.equal(
      preflight.headers.get("access-control-allow-origin"),
      allowedOrigin,
    );
  });

  it("protects the portfolio photo upload route with the session token", async () => {
    const { cookie, csrfToken } = await loginAndGetCookie();
    const rejected = await request("/portfolio/project-1/photos", {
      method: "POST",
      headers: { Cookie: cookie!, Origin: allowedOrigin },
    });
    assert.equal(rejected.status, 403);
    const accepted = await request("/portfolio/project-1/photos", {
      method: "POST",
      headers: {
        Cookie: cookie!,
        Origin: allowedOrigin,
        "X-CSRF-Token": csrfToken,
      },
    });
    assert.equal(accepted.status, 201);
  });

  it("leaves public subscription and Daraja webhook routes outside admin CSRF checks", async () => {
    const publicPost = await request("/newsletter/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://visitor.example",
      },
      body: JSON.stringify({ email: "visitor@example.test" }),
    });
    const webhook = await request("/webhooks/daraja", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback: true }),
    });

    assert.equal(publicPost.status, 201);
    assert.equal(webhook.status, 200);
  });

  it("requires CSRF protection for logout and invalidates its session", async () => {
    const { cookie, csrfToken } = await loginAndGetCookie();
    const response = await request("/auth/logout", {
      method: "POST",
      headers: {
        Cookie: cookie!,
        Origin: allowedOrigin,
        "X-CSRF-Token": csrfToken,
      },
    });

    assert.equal(response.status, 204);
    assert.deepEqual(destroyedSessions, [cookie!.split("=")[1]]);
    assert.match(response.headers.get("cache-control") ?? "", /no-store/i);
    const rejected = await request("/admin/mutation", {
      method: "POST",
      headers: {
        Cookie: cookie!,
        Origin: allowedOrigin,
        "X-CSRF-Token": csrfToken,
      },
    });
    assert.equal(rejected.status, 401);
  });
});
