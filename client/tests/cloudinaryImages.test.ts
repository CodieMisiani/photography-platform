import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cloudinaryImageUrl,
  getImageFallbackState,
  isCloudinaryImage,
} from "../src/lib/cloudinaryImages.ts";

describe("Cloudinary image URL delivery", () => {
  it("adds a transformation to a standard upload URL without changing its public ID", () => {
    const original = "https://res.cloudinary.com/demo/image/upload/photo.jpg";
    const result = new URL(cloudinaryImageUrl(original, 640));

    assert.equal(
      result.pathname,
      "/demo/image/upload/f_auto,q_auto,w_640,c_limit/photo.jpg",
    );
  });

  it("keeps the version and nested folder/public ID intact", () => {
    const original =
      "https://res.cloudinary.com/demo/image/upload/v1234567890/weddings/2026/couple.jpg";
    const result = new URL(cloudinaryImageUrl(original, 960));

    assert.equal(
      result.pathname,
      "/demo/image/upload/f_auto,q_auto,w_960,c_limit/v1234567890/weddings/2026/couple.jpg",
    );
  });

  it("appends after existing transformations and before the version", () => {
    const original =
      "https://res.cloudinary.com/demo/image/upload/c_fill,w_800,ar_4:3/v1234567890/events/portrait.jpg";
    const result = new URL(cloudinaryImageUrl(original, 640));

    assert.equal(
      result.pathname,
      "/demo/image/upload/c_fill,w_800,ar_4:3/f_auto,q_auto,w_640,c_limit/v1234567890/events/portrait.jpg",
    );
  });

  it("recognizes ar_ in an existing no-version transform chain", () => {
    const original =
      "https://res.cloudinary.com/demo/image/upload/ar_4:3,c_fill/events/portrait.jpg";
    const result = new URL(cloudinaryImageUrl(original, 640));

    assert.equal(
      result.pathname,
      "/demo/image/upload/ar_4:3,c_fill/f_auto,q_auto,w_640,c_limit/events/portrait.jpg",
    );
  });

  it("preserves query parameters and fragments", () => {
    const original =
      "https://res.cloudinary.com/demo/image/upload/v123/photo.jpg?download=1&token=abc#preview";
    const result = new URL(cloudinaryImageUrl(original, 320));

    assert.equal(result.search, "?download=1&token=abc");
    assert.equal(result.hash, "#preview");
    assert.equal(result.pathname.endsWith("/v123/photo.jpg"), true);
  });

  it("passes through non-Cloudinary URLs unchanged", () => {
    const original = "https://images.example.test/gallery/photo.jpg?size=full";

    assert.equal(isCloudinaryImage(original), false);
    assert.equal(cloudinaryImageUrl(original, 640), original);
  });

  it("passes through Cloudinary fetch URLs unchanged", () => {
    const original =
      "https://res.cloudinary.com/demo/image/fetch/https://images.example.test/photo.jpg";

    assert.equal(isCloudinaryImage(original), false);
    assert.equal(cloudinaryImageUrl(original, 640), original);
  });

  it("does not classify lookalike hosts as Cloudinary", () => {
    const original =
      "https://res.cloudinary.com.attacker.example/demo/image/upload/photo.jpg";

    assert.equal(isCloudinaryImage(original), false);
    assert.equal(cloudinaryImageUrl(original, 640), original);
  });

  it("falls back from a failed transformation to the original and then the placeholder", () => {
    const original = "https://res.cloudinary.com/demo/image/upload/photo.jpg";
    const transformed = cloudinaryImageUrl(original, 960);

    const originalFallback = getImageFallbackState(
      original,
      transformed,
      false,
    );
    assert.deepEqual(originalFallback, {
      src: original,
      useOriginalSource: true,
      hasError: false,
    });

    const placeholder = getImageFallbackState(original, transformed, true);
    assert.deepEqual(placeholder, {
      src: original,
      useOriginalSource: true,
      hasError: true,
    });
  });

  it("uses the placeholder immediately when the original URL is not transformed", () => {
    const original = "https://images.example.test/photo.jpg";

    assert.deepEqual(getImageFallbackState(original, original, false), {
      src: original,
      useOriginalSource: false,
      hasError: true,
    });
  });
});
