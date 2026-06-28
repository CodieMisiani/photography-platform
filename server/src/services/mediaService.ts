import { cloudinary } from "../config/cloudinary.js";
import { AppError } from "../utils/AppError.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 8 * 1024 * 1024;

export async function uploadPortfolioImage(file?: Express.Multer.File) {
  if (!file) {
    throw new AppError(400, "Image file is required", "IMAGE_REQUIRED");
  }
  if (!allowedMimeTypes.has(file.mimetype)) {
    throw new AppError(400, "Unsupported image type", "IMAGE_TYPE_UNSUPPORTED");
  }
  if (file.size > maxBytes) {
    throw new AppError(400, "Image must be smaller than 8MB", "IMAGE_TOO_LARGE");
  }

  const encoded = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(encoded, {
    folder: "photography-platform/portfolio",
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
}
