type PortfolioCoverRecord = {
  cover_url: string | null;
  cover_public_id: string | null;
};

const transformationSegment =
  /^(?:a|ar|b|bo|c|cs|d|dpr|e|f|fl|g|h|if|ki|l|o|q|r|t|u|w|x|y|z)_/;
const signedTransformationSegment = /^s--[A-Za-z0-9_-]+--$/;
const cloudinaryImageExtension =
  /\.(?:avif|bmp|gif|jpe?g|jxl|png|svg|tiff?|webp)$/i;

export function cloudinaryUrlMatchesPublicId(
  coverUrl: string | null | undefined,
  publicId: string | null | undefined,
) {
  if (!coverUrl || !publicId?.trim()) return false;

  try {
    const url = new URL(coverUrl);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.hostname !== "res.cloudinary.com" ||
      !url.pathname.includes("/image/upload/")
    ) {
      return false;
    }

    const [, deliveryPath] = url.pathname.split("/image/upload/");
    if (!deliveryPath) return false;

    const segments = deliveryPath.split("/").map(decodeURIComponent);
    while (
      segments.length > 0 &&
      (transformationSegment.test(segments[0]) ||
        signedTransformationSegment.test(segments[0]))
    ) {
      segments.shift();
    }
    if (segments[0] && /^v\d+$/.test(segments[0])) segments.shift();

    const lastSegment = segments.at(-1);
    if (lastSegment) {
      segments[segments.length - 1] = lastSegment.replace(
        cloudinaryImageExtension,
        "",
      );
    }

    return segments.join("/") === publicId;
  } catch {
    return false;
  }
}

export async function persistPortfolioCoverUpdate<
  T extends PortfolioCoverRecord,
>(
  current: T,
  payload: Partial<T>,
  update: (payload: Partial<T>) => Promise<T>,
  hasOtherReferences: (publicId: string) => Promise<boolean>,
  deleteAsset: (publicId: string) => Promise<unknown>,
): Promise<T> {
  const updates = { ...payload };
  const hasCoverUrl = Object.hasOwn(payload, "cover_url");
  const hasCoverPublicId = Object.hasOwn(payload, "cover_public_id");

  if (hasCoverUrl || hasCoverPublicId) {
    const nextUrl = hasCoverUrl ? payload.cover_url : current.cover_url;
    let nextPublicId = hasCoverPublicId
      ? payload.cover_public_id
      : current.cover_public_id;

    if (
      current.cover_public_id &&
      cloudinaryUrlMatchesPublicId(nextUrl, current.cover_public_id)
    ) {
      nextPublicId = current.cover_public_id;
    } else if (
      hasCoverUrl &&
      nextUrl !== current.cover_url &&
      !hasCoverPublicId
    ) {
      nextPublicId = null;
    }

    updates.cover_url = nextUrl as T["cover_url"];
    updates.cover_public_id = nextPublicId as T["cover_public_id"];
  }

  const updated = await update(updates);
  if (
    current.cover_public_id &&
    current.cover_public_id !== updated.cover_public_id
  ) {
    try {
      if (!(await hasOtherReferences(current.cover_public_id))) {
        await deleteAsset(current.cover_public_id);
      }
    } catch (error) {
      console.error("[portfolioService] Previous cover cleanup failed", {
        publicId: current.cover_public_id,
        error,
      });
    }
  }
  return updated;
}
