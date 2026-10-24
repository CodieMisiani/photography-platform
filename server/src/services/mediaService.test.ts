import assert from "node:assert/strict";
import { once } from "node:events";
import { describe, it } from "node:test";
import express from "express";
import sharp from "sharp";
import type { UploadApiResponse } from "cloudinary";
import { createErrorHandler } from "../middleware/errorHandler.js";
import {
  createMediaUploadService,
  imageUploadLimits,
  singleImageUpload,
  validateImageFile,
} from "./mediaService.js";

function multerFile(
  buffer: Buffer,
  originalname: string,
  mimetype: string,
): Express.Multer.File {
  return {
    fieldname: "image",
    originalname,
    encoding: "7bit",
    mimetype,
    size: buffer.length,
    buffer,
  } as Express.Multer.File;
}

async function image(format: "jpeg" | "png" | "webp", width = 2, height = 2) {
  const pipeline = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 40, g: 90, b: 160 },
    },
  });
  if (format === "jpeg") return pipeline.jpeg().toBuffer();
  if (format === "png") return pipeline.png().toBuffer();
  return pipeline.webp().toBuffer();
}

function uploadResult() {
  return {
    secure_url: "https://res.cloudinary.com/test/image/upload/test.jpg",
    public_id: "test",
  } as UploadApiResponse;
}

describe("server-side image upload validation", () => {
  it("accepts and fully decodes supported JPEG, PNG, and WebP originals", async () => {
    for (const [format, mime, name] of [
      ["jpeg", "image/jpeg", "photo.jpg"],
      ["png", "image/png", "photo.png"],
      ["webp", "image/webp", "photo.webp"],
    ] as const) {
      await validateImageFile(multerFile(await image(format), name, mime));
    }
  });

  it("rejects non-image payloads renamed as JPEG without calling Cloudinary", async () => {
    let uploads = 0;
    const upload = createMediaUploadService(async () => {
      uploads += 1;
      return uploadResult();
    });

    await assert.rejects(
      upload(
        multerFile(
          Buffer.from("MZ executable payload"),
          "fake.jpg",
          "image/jpeg",
        ),
        { folder: "portfolio" },
      ),
      { code: "IMAGE_INVALID" },
    );
    assert.equal(uploads, 0);
  });

  it("rejects declared MIME and filename formats that disagree with actual image bytes", async () => {
    const jpeg = await image("jpeg");
    await assert.rejects(
      validateImageFile(multerFile(jpeg, "photo.png", "image/png")),
      { code: "IMAGE_TYPE_MISMATCH" },
    );
    await assert.rejects(
      validateImageFile(multerFile(jpeg, "photo.png", "image/jpeg")),
      { code: "IMAGE_TYPE_MISMATCH" },
    );
    await assert.rejects(
      validateImageFile(
        multerFile(Buffer.from("plain text"), "fake.jpg", "text/plain"),
      ),
      { code: "IMAGE_TYPE_UNSUPPORTED" },
    );
  });

  it("rejects empty, truncated, and malformed image data", async () => {
    const valid = await image("png");
    for (const payload of [
      Buffer.alloc(0),
      valid.subarray(0, 20),
      Buffer.from("not a png"),
    ]) {
      await assert.rejects(
        validateImageFile(multerFile(payload, "broken.png", "image/png")),
        { code: "IMAGE_INVALID" },
      );
    }
  });

  it("rejects compressed files above the 15 MiB service limit", async () => {
    const tooLarge = Buffer.alloc(imageUploadLimits.maxBytes + 1);
    await assert.rejects(
      validateImageFile(multerFile(tooLarge, "large.jpg", "image/jpeg")),
      { code: "IMAGE_TOO_LARGE" },
    );
  });

  it("rejects images over side and total-pixel bounds before full decoding", async () => {
    const tooWide = await image("png", imageUploadLimits.maxWidth + 1, 1);
    await assert.rejects(
      validateImageFile(multerFile(tooWide, "wide.png", "image/png")),
      { code: "IMAGE_DIMENSIONS_EXCEEDED" },
    );

    const tooManyPixels = await image("png", 6_500, 6_200);
    await assert.rejects(
      validateImageFile(multerFile(tooManyPixels, "pixels.png", "image/png")),
      { code: "IMAGE_DIMENSIONS_EXCEEDED" },
    );
  });

  it("uses the one-file gallery request limit and uploads valid files only after validation", async () => {
    assert.equal(imageUploadLimits.maxFilesPerRequest, 1);
    let uploads = 0;
    const upload = createMediaUploadService(async () => {
      uploads += 1;
      return uploadResult();
    });

    const result = await upload(
      multerFile(await image("jpeg"), "valid.jpg", "image/jpeg"),
      { folder: "portfolio" },
    );
    assert.equal(uploads, 1);
    assert.equal(result.public_id, "test");
  });

  it("enforces the gallery multipart file-count limit in the parser", async () => {
    const app = express();
    app.post("/upload", singleImageUpload("image"), (_req, res) => {
      res.sendStatus(201);
    });
    app.use(createErrorHandler(false));
    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");

    try {
      const form = new FormData();
      const valid = await image("jpeg");
      form.append(
        "image",
        new Blob([valid], { type: "image/jpeg" }),
        "one.jpg",
      );
      form.append(
        "image",
        new Blob([valid], { type: "image/jpeg" }),
        "two.jpg",
      );
      const response = await fetch(`http://127.0.0.1:${address.port}/upload`, {
        method: "POST",
        body: form,
      });
      assert.equal(response.status, 400);
      const payload = (await response.json()) as { error: { code: string } };
      assert.equal(payload.error.code, "IMAGE_FILE_COUNT_INVALID");

      const oversizedForm = new FormData();
      oversizedForm.append(
        "image",
        new Blob([Buffer.alloc(imageUploadLimits.maxBytes + 1)], {
          type: "image/jpeg",
        }),
        "large.jpg",
      );
      const oversizedResponse = await fetch(
        `http://127.0.0.1:${address.port}/upload`,
        { method: "POST", body: oversizedForm },
      );
      assert.equal(oversizedResponse.status, 413);
      const oversizedPayload = (await oversizedResponse.json()) as {
        error: { code: string };
      };
      assert.equal(oversizedPayload.error.code, "IMAGE_TOO_LARGE");
    } finally {
      server.close();
      await once(server, "close");
    }
  });
});
