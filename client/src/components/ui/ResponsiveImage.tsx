import { useState } from "react";
import {
  cloudinaryImageUrl,
  getImageFallbackState,
  isCloudinaryImage,
} from "../../lib/cloudinaryImages";

type ResponsiveImageProps = {
  src: string | null | undefined;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  className?: string;
  priority?: boolean;
};

const responsiveWidths = [320, 640, 960, 1440];

export default function ResponsiveImage({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  priority = false,
}: ResponsiveImageProps) {
  const [errorState, setErrorState] = useState<{
    src: string | null | undefined;
    hasError: boolean;
    useOriginalSource: boolean;
  } | null>(null);
  const hasError =
    errorState && errorState.src === src ? errorState.hasError : false;
  const useOriginalSource =
    errorState && errorState.src === src ? errorState.useOriginalSource : false;

  if (!src || hasError) {
    return (
      <div
        className={`${className ?? ""} bg-paper-deep`}
        role="img"
        aria-label={alt || "Image unavailable"}
      >
        <span className="sr-only">Image unavailable</span>
      </div>
    );
  }

  const useResponsiveSourceSet = isCloudinaryImage(src);
  const optimizedSource = cloudinaryImageUrl(src, width);
  const srcSet = useResponsiveSourceSet
    ? responsiveWidths
        .map(
          (candidateWidth) =>
            `${cloudinaryImageUrl(src, candidateWidth)} ${candidateWidth}w`,
        )
        .join(", ")
    : undefined;

  return (
    <img
      src={useOriginalSource ? src : optimizedSource}
      srcSet={useOriginalSource ? undefined : srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={className}
      onError={() => {
        setErrorState(
          getImageFallbackState(src, optimizedSource, useOriginalSource),
        );
      }}
    />
  );
}
