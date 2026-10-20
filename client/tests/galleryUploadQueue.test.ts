import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mergeGalleryUploadEntries,
  reserveGallerySortOrders,
} from "../src/lib/galleryUploadQueue.ts";

describe("gallery upload queue updates", () => {
  it("replaces a failed entry on retry instead of appending a duplicate", () => {
    const failed = {
      id: "retry-me",
      name: "portrait.jpg",
      progress: 0,
      error: "Upload failed",
    };
    const other = { id: "other", name: "event.jpg", progress: 45 };
    const retry = { id: "retry-me", name: "portrait.jpg", progress: 0 };

    const result = mergeGalleryUploadEntries([failed, other], [retry]);

    assert.deepEqual(result, [retry, other]);
    assert.equal(result.filter((entry) => entry.id === "retry-me").length, 1);
  });

  it("appends new uploads while preserving existing entries", () => {
    const existing = { id: "existing", name: "existing.jpg", progress: 30 };
    const added = { id: "new", name: "new.jpg", progress: 0 };

    assert.deepEqual(mergeGalleryUploadEntries([existing], [added]), [
      existing,
      added,
    ]);
  });

  it("reserves distinct sort orders across overlapping upload batches", () => {
    const firstBatch = reserveGallerySortOrders([0, 1], 0, 2);
    const secondBatch = reserveGallerySortOrders(
      [0, 1],
      firstBatch.nextReservedSortOrder,
      1,
    );

    assert.deepEqual(firstBatch.sortOrders, [2, 3]);
    assert.deepEqual(secondBatch.sortOrders, [4]);
  });
});
