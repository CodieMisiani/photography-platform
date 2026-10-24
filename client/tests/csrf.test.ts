import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyCsrfHeader,
  updateCsrfTokenFromAuthResponse,
} from "../src/lib/csrf.ts";

const csrfToken = "a".repeat(64);

describe("client synchronizer CSRF token handling", () => {
  it("stores the token returned by login and attaches it to unsafe requests", () => {
    updateCsrfTokenFromAuthResponse("/auth/login", {
      admin: { email: "admin@example.test" },
      csrfToken,
    });

    const headers = new Headers();
    applyCsrfHeader("POST", headers);

    assert.equal(headers.get("X-CSRF-Token"), csrfToken);
  });

  it("restores the token from the authenticated session response", () => {
    updateCsrfTokenFromAuthResponse("/auth/logout", null);
    updateCsrfTokenFromAuthResponse("/auth/me", {
      admin: { email: "admin@example.test" },
      csrfToken,
    });

    const headers = new Headers();
    applyCsrfHeader("PATCH", headers);

    assert.equal(headers.get("X-CSRF-Token"), csrfToken);
  });

  it("does not add a CSRF header to safe methods", () => {
    updateCsrfTokenFromAuthResponse("/auth/login", {
      admin: { email: "admin@example.test" },
      csrfToken,
    });

    for (const method of ["GET", "HEAD", "OPTIONS"]) {
      const headers = new Headers();
      applyCsrfHeader(method, headers);
      assert.equal(headers.has("X-CSRF-Token"), false);
    }
  });

  it("clears the in-memory token when session restoration is unauthenticated", () => {
    updateCsrfTokenFromAuthResponse("/auth/me", {
      admin: null,
      csrfToken: null,
    });

    const headers = new Headers();
    applyCsrfHeader("DELETE", headers);

    assert.equal(headers.has("X-CSRF-Token"), false);
  });
});
