import multer from "multer";
import { Readable } from "node:stream";
import type { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../config/cloudinary.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export type MediaFolder = "portfolio" | "events";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 8 * 1024 * 1024;

export const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxBytes, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError(400, "Unsupported image type", "IMAGE_TYPE_UNSUPPORTED"));
      return;
    }
    callback(null, true);
  },
});

export async function uploadMedia(
  file: Express.Multer.File | undefined,
  options: { folder: MediaFolder },
) {
  if (!file) {
    throw new AppError(400, "Image file is required", "IMAGE_REQUIRED");
  }
  if (!allowedMimeTypes.has(file.mimetype)) {
    throw new AppError(400, "Unsupported image type", "IMAGE_TYPE_UNSUPPORTED");
  }
  if (file.size > maxBytes) {
    throw new AppError(400, "Image must be smaller than 8MB", "IMAGE_TOO_LARGE");
  }

  const result = await streamUpload(file.buffer, {
    folder: `${env.CLOUDINARY_FOLDER}/${options.folder}`,
  });

  return {
    secure_url: result.secure_url,
    url: result.secure_url,
    public_id: result.public_id,
  };
}

export async function deleteMedia(publicId: string | null | undefined) {
  if (!publicId) {
    console.warn("[mediaService] Cloudinary public_id missing; skipping destroy.");
    return { skipped: true };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    if (result.result !== "ok" && result.result !== "not found") {
      console.error("[mediaService] Cloudinary destroy returned unexpected result", {
        publicId,
        result,
      });
    }
    return { skipped: false, result };
  } catch (error) {
    console.error("[mediaService] Cloudinary destroy failed; DB delete will continue", {
      publicId,
      error,
    });
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
          reject(new AppError(502, "Cloudinary upload failed", "CLOUDINARY_UPLOAD_FAILED"));
          return;
        }
        resolve(result);
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}
