import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseExternalImageUrl } from "./imageUrl.js";

describe("parseExternalImageUrl", () => {
  it("accepts and trims HTTP and HTTPS URLs", () => {
    assert.equal(parseExternalImageUrl("  https://example.com/photo.jpg  "), "https://example.com/photo.jpg");
    assert.equal(parseExternalImageUrl(" http://example.com/photo.jpg "), "http://example.com/photo.jpg");
  });

  it("rejects unsupported, malformed, empty, and non-string values", () => {
    for (const value of ["javascript:alert(1)", "data:image/png;base64,abc", "ftp://example.com/photo.jpg", "not a url", "", "   ", null, 42]) {
      assert.equal(parseExternalImageUrl(value), null);
    }
  });

  it("rejects values longer than 2000 characters", () => {
    assert.equal(parseExternalImageUrl(`https://example.com/${"a".repeat(2000)}`), null);
  });
});
