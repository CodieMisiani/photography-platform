import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isValidImageUrl } from "../src/lib/imageUrl.ts";

describe("isValidImageUrl", () => {
  it("accepts HTTP and HTTPS URLs with surrounding whitespace", () => {
    assert.equal(isValidImageUrl("  https://example.com/photo.jpg  "), true);
    assert.equal(isValidImageUrl(" http://example.com/photo.jpg "), true);
  });

  it("rejects unsupported, malformed, empty, and non-string values", () => {
    for (const value of ["javascript:alert(1)", "data:image/png;base64,abc", "ftp://example.com/photo.jpg", "not a url", "", "   ", null, 42] as unknown[]) {
      assert.equal(isValidImageUrl(value as string), false);
    }
  });

  it("rejects values longer than 2000 characters", () => {
    assert.equal(isValidImageUrl(`https://example.com/${"a".repeat(2000)}`), false);
  });
});
