import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cloudinaryUrlMatchesPublicId,
  persistPortfolioCoverUpdate,
} from "./portfolioCoverUpdate.js";

const existing: {
  id: string;
  title: string;
  cover_url: string | null;
  cover_public_id: string | null;
} = {
  id: "project-1",
  title: "Portrait",
  cover_url: "https://res.cloudinary.com/demo/image/upload/v123/portrait.jpg",
  cover_public_id: "portfolio/portrait",
};

describe("portfolio cover update cleanup", () => {
  it("matches an exact transformed Cloudinary asset path", () => {
    assert.equal(
      cloudinaryUrlMatchesPublicId(
        "https://res.cloudinary.com/demo/image/upload/c_fill,w_800/portfolio/portrait.jpg",
        "portfolio/portrait",
      ),
      true,
    );
  });

  it("matches an exact versioned Cloudinary asset path", () => {
    assert.equal(
      cloudinaryUrlMatchesPublicId(
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v123/portfolio/portrait.webp",
        "portfolio/portrait",
      ),
      true,
    );
  });

  it("matches a versioned Cloudinary URL with a signed transformation", () => {
    assert.equal(
      cloudinaryUrlMatchesPublicId(
        "https://res.cloudinary.com/demo/image/upload/c_fill,w_800/s--abc123--/v123/portfolio/portrait.jpg",
        "portfolio/portrait",
      ),
      true,
    );
  });

  it("does not match a nested path that only has the public ID as a suffix", () => {
    assert.equal(
      cloudinaryUrlMatchesPublicId(
        "https://res.cloudinary.com/demo/image/upload/archive/portfolio/portrait.jpg",
        "portfolio/portrait",
      ),
      false,
    );
  });

  it("does not match a similarly named asset", () => {
    assert.equal(
      cloudinaryUrlMatchesPublicId(
        "https://res.cloudinary.com/demo/image/upload/v123/portfolio/portrait-extra.jpg",
        "portfolio/portrait",
      ),
      false,
    );
  });

  it("rejects missing or invalid Cloudinary public IDs and URLs", () => {
    assert.equal(
      cloudinaryUrlMatchesPublicId(
        "https://res.cloudinary.com/demo/image/upload/v123/portfolio/portrait.jpg",
        null,
      ),
      false,
    );
    assert.equal(
      cloudinaryUrlMatchesPublicId(
        "https://res.cloudinary.com.attacker.example/demo/image/upload/v123/portfolio/portrait.jpg",
        "portfolio/portrait",
      ),
      false,
    );
    assert.equal(
      cloudinaryUrlMatchesPublicId("not a URL", "portfolio/portrait"),
      false,
    );
  });

  it("preserves the existing asset when URL mode selects a transformed URL for it", async () => {
    const deleted: string[] = [];
    let saved = existing;
    const sameAssetUrl =
      "https://res.cloudinary.com/demo/image/upload/c_fill,w_800/v123/portfolio/portrait.jpg";

    const result = await persistPortfolioCoverUpdate(
      existing,
      { cover_url: sameAssetUrl, cover_public_id: null },
      async (payload) => {
        saved = { ...existing, ...payload };
        return saved;
      },
      async () => false,
      async (publicId) => void deleted.push(publicId),
    );

    assert.equal(result.cover_url, sameAssetUrl);
    assert.equal(saved.cover_public_id, existing.cover_public_id);
    assert.deepEqual(deleted, []);
  });

  it("deletes the old asset only after a different uploaded cover is saved", async () => {
    const events: string[] = [];
    const result = await persistPortfolioCoverUpdate(
      existing,
      {
        cover_url: "https://res.cloudinary.com/demo/image/upload/v456/new.jpg",
        cover_public_id: "portfolio/new",
      },
      async (payload) => {
        events.push("saved");
        return { ...existing, ...payload };
      },
      async () => false,
      async (publicId) => void events.push(`deleted:${publicId}`),
    );

    assert.equal(result.cover_public_id, "portfolio/new");
    assert.deepEqual(events, ["saved", "deleted:portfolio/portrait"]);
  });

  it("deletes the old asset after the supported clear-cover update is saved", async () => {
    const events: string[] = [];
    const result = await persistPortfolioCoverUpdate(
      existing,
      { cover_url: null, cover_public_id: null },
      async (payload) => {
        events.push("saved");
        return { ...existing, ...payload };
      },
      async () => false,
      async (publicId) => void events.push(`deleted:${publicId}`),
    );

    assert.equal(result.cover_url, null);
    assert.equal(result.cover_public_id, null);
    assert.deepEqual(events, ["saved", "deleted:portfolio/portrait"]);
  });

  it("preserves a cover when an update omits cover fields", async () => {
    const deleted: string[] = [];
    const result = await persistPortfolioCoverUpdate(
      existing,
      { title: "Updated portrait" },
      async (payload) => ({ ...existing, ...payload }),
      async () => false,
      async (publicId) => void deleted.push(publicId),
    );

    assert.equal(result.cover_url, existing.cover_url);
    assert.equal(result.cover_public_id, existing.cover_public_id);
    assert.deepEqual(deleted, []);
  });

  it("does not delete an asset when saving the replacement fails", async () => {
    const deleted: string[] = [];

    await assert.rejects(
      persistPortfolioCoverUpdate(
        existing,
        { cover_url: null, cover_public_id: null },
        async () => {
          throw new Error("database update failed");
        },
        async () => false,
        async (publicId) => void deleted.push(publicId),
      ),
      /database update failed/,
    );

    assert.deepEqual(deleted, []);
  });

  it("does not delete an asset when an edit is cancelled before persistence", async () => {
    const deleted: string[] = [];

    await assert.rejects(
      persistPortfolioCoverUpdate(
        existing,
        { cover_url: null, cover_public_id: null },
        async () => {
          throw new DOMException("Edit cancelled", "AbortError");
        },
        async () => false,
        async (publicId) => void deleted.push(publicId),
      ),
      { name: "AbortError" },
    );

    assert.deepEqual(deleted, []);
  });

  it("keeps a shared Cloudinary asset when another saved record references it", async () => {
    const deleted: string[] = [];
    const result = await persistPortfolioCoverUpdate(
      existing,
      {
        cover_url: "https://images.example.test/replacement.jpg",
        cover_public_id: null,
      },
      async (payload) => ({ ...existing, ...payload }),
      async () => true,
      async (publicId) => void deleted.push(publicId),
    );

    assert.equal(result.cover_public_id, null);
    assert.deepEqual(deleted, []);
  });

  it("keeps the saved replacement and logs when Cloudinary cleanup rejects", async () => {
    const logs: unknown[][] = [];
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => logs.push(args);

    try {
      const result = await persistPortfolioCoverUpdate(
        existing,
        {
          cover_url:
            "https://res.cloudinary.com/demo/image/upload/v456/new.jpg",
          cover_public_id: "portfolio/new",
        },
        async (payload) => ({ ...existing, ...payload }),
        async () => false,
        async () => {
          throw new Error("Cloudinary unavailable");
        },
      );

      assert.equal(
        result.cover_url,
        "https://res.cloudinary.com/demo/image/upload/v456/new.jpg",
      );
      assert.equal(result.cover_public_id, "portfolio/new");
      assert.equal(logs.length, 1);
      assert.match(String(logs[0][0]), /Previous cover cleanup failed/);
    } finally {
      console.error = originalConsoleError;
    }
  });
});
