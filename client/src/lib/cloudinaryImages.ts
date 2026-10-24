const transformationSegment =
  /^(?:a|ar|b|bo|c|cs|d|dpr|e|f|fl|g|h|if|ki|l|o|q|r|t|u|w|x|y|z)_/;

export function isCloudinaryImage(src: string) {
  try {
    const url = new URL(src);
    return (
      url.hostname === "res.cloudinary.com" &&
      url.pathname.includes("/image/upload/")
    );
  } catch {
    return false;
  }
}

export function cloudinaryImageUrl(src: string, width: number) {
  try {
    const url = new URL(src);
    if (!isCloudinaryImage(src)) return src;

    const [beforeUpload, afterUpload] = url.pathname.split("/image/upload/");
    if (!afterUpload) return src;

    const segments = afterUpload.split("/");
    const versionIndex = segments.findIndex((segment) =>
      /^v\d+$/.test(segment),
    );
    const existingTransformCount = segments.findIndex(
      (segment) => !transformationSegment.test(segment),
    );
    const assetIndex =
      versionIndex === -1
        ? existingTransformCount === -1
          ? segments.length
          : existingTransformCount
        : versionIndex;
    segments.splice(assetIndex, 0, `f_auto,q_auto,w_${width},c_limit`);
    url.pathname = `${beforeUpload}/image/upload/${segments.join("/")}`;
    return url.toString();
  } catch {
    return src;
  }
}

export function getImageFallbackState(
  src: string,
  optimizedSrc: string,
  currentlyUsingOriginal: boolean,
) {
  if (!currentlyUsingOriginal && optimizedSrc !== src) {
    return { src, useOriginalSource: true, hasError: false };
  }
  return { src, useOriginalSource: currentlyUsingOriginal, hasError: true };
}
