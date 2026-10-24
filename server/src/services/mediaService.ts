import multer from "multer";
import path from "node:path";
import { Readable } from "node:stream";
import type { NextFunction, Request, Response } from "express";
import type { UploadApiResponse } from "cloudinary";
import sharp, { type Metadata } from "sharp";
import { cloudinary } from "../config/cloudinary.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export type MediaFolder = "portfolio" | "events" | "journal";

export const imageUploadLimits = {
  maxBytes: 15 * 1024 * 1024,
  maxWidth: 12_000,
  maxHeight: 12_000,
  maxPixels: 40_000_000,
  maxFilesPerRequest: 1,
} as const;

const supportedImages = {
  jpeg: { mimeType: "image/jpeg", extensions: new Set([".jpg", ".jpeg"]) },
  png: { mimeType: "image/png", extensions: new Set([".png"]) },
  webp: { mimeType: "image/webp", extensions: new Set([".webp"]) },
} as const;
const allowedMimeTypes = new Set<string>(
  Object.values(supportedImages).map(({ mimeType }) => mimeType),
);

export const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: imageUploadLimits.maxBytes,
    files: imageUploadLimits.maxFilesPerRequest,
    fields: 20,
    fieldSize: 256 * 1024,
    parts: 21,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new AppError(400, "Unsupported image type", "IMAGE_TYPE_UNSUPPORTED"),
      );
      return;
    }
    callback(null, true);
  },
});

/** Adapt Multer's parser errors into stable, safe API errors. */
export function singleImageUpload(fieldName: string) {
  const parse = mediaUpload.single(fieldName);
  return (req: Request, res: Response, next: NextFunction) => {
    parse(req, res, (error?: unknown) => {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          next(
            new AppError(413, "Image must be 15MB or smaller", "IMAGE_TOO_LARGE"),
          );
          return;
        }
        if (error.code === "LIMIT_FILE_COUNT") {
          next(
            new AppError(
              400,
              "Only one image is allowed per request",
              "IMAGE_FILE_COUNT_INVALID",
            ),
          );
          return;
        }
        next(
          new AppError(400, "Invalid multipart image upload", "IMAGE_UPLOAD_INVALID"),
        );
        return;
      }
      next(error);
    });
  };
}

export async function validateImageFile(
  file: Express.Multer.File,
): Promise<void> {
  if (!file.buffer?.length || file.size !== file.buffer.length) {
    throw invalidImage();
  }
  if (file.size > imageUploadLimits.maxBytes) {
    throw new AppError(
      413,
      "Image must be 15MB or smaller",
      "IMAGE_TOO_LARGE",
    );
  }

  const declaredFormat = Object.entries(supportedImages).find(
    ([, definition]) => definition.mimeType === file.mimetype,
  )?.[0] as keyof typeof supportedImages | undefined;
  if (!declaredFormat) {
    throw new AppError(400, "Unsupported image type", "IMAGE_TYPE_UNSUPPORTED");
  }

  const extension = path.extname(file.originalname).toLowerCase();
  if (!supportedImages[declaredFormat].extensions.has(extension)) {
    throw new AppError(
      400,
      "Image type does not match its filename",
      "IMAGE_TYPE_MISMATCH",
    );
  }

  let metadata: Metadata;
  try {
    metadata = await sharp(file.buffer, {
      failOn: "warning",
      // Metadata reads only container headers; the full decode below keeps the
      // strict pixel cap. A larger metadata cap lets us return a dimension error
      // before sharp's decoder rejects an otherwise correctly identified image.
      limitInputPixels: imageUploadLimits.maxPixels * 2,
      sequentialRead: true,
    }).metadata();
  } catch {
    throw invalidImage();
  }

  if (metadata.format !== declaredFormat) {
    throw new AppError(
      400,
      "Image type does not match its content",
      "IMAGE_TYPE_MISMATCH",
    );
  }

  const { width, height } = metadata;
  if (
    !width ||
    !height ||
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height)
  ) {
    throw invalidImage();
  }
  if (
    width > imageUploadLimits.maxWidth ||
    height > imageUploadLimits.maxHeight ||
    width * height > imageUploadLimits.maxPixels
  ) {
    throw new AppError(
      400,
      "Image dimensions exceed the allowed limit",
      "IMAGE_DIMENSIONS_EXCEEDED",
    );
  }
  if ((metadata.pages ?? 1) > 1) {
    throw new AppError(
      400,
      "Animated images are not supported",
      "IMAGE_TYPE_UNSUPPORTED",
    );
  }

  try {
    await sharp(file.buffer, {
      failOn: "warning",
      limitInputPixels: imageUploadLimits.maxPixels,
      sequentialRead: true,
    }).stats();
  } catch {
    throw invalidImage();
  }
}

function invalidImage() {
  return new AppError(400, "Image is empty, malformed, or invalid", "IMAGE_INVALID");
}

type MediaUploader = (
  buffer: Buffer,
  options: { folder: string },
) => Promise<UploadApiResponse>;

export function createMediaUploadService(upload: MediaUploader = streamUpload) {
  return async function uploadMedia(
    file: Express.Multer.File | undefined,
    options: { folder: MediaFolder },
  ) {
    if (!file) {
      throw new AppError(400, "Image file is required", "IMAGE_REQUIRED");
    }
    await validateImageFile(file);

    const result = await upload(file.buffer, {
      folder: `${env.CLOUDINARY_FOLDER}/${options.folder}`,
    });

    return {
      secure_url: result.secure_url,
      url: result.secure_url,
      public_id: result.public_id,
    };
  };
}

export const uploadMedia = createMediaUploadService();

export async function deleteMedia(publicId: string | null | undefined) {
  if (!publicId) {
    console.warn(
      "[mediaService] Cloudinary public_id missing; skipping destroy.",
    );
    return { skipped: true };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    if (result.result !== "ok" && result.result !== "not found") {
      console.error(
        "[mediaService] Cloudinary destroy returned unexpected result",
        {
          publicId,
          result,
        },
      );
    }
    return { skipped: false, result };
  } catch (error) {
    console.error(
      "[mediaService] Cloudinary destroy failed; DB delete will continue",
      {
        publicId,
        error,
      },
    );
    return { skipped: false, error };
  }
}

function streamUpload(
  buffer: Buffer,
  options: { folder: string },
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(
            new AppError(
              502,
              "Cloudinary upload failed",
              "CLOUDINARY_UPLOAD_FAILED",
            ),
          );
          return;
        }
        resolve(result);
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}
