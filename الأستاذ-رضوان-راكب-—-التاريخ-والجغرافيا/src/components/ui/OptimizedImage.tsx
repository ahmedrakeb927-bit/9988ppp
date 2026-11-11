import React, { useState, useEffect, memo } from 'react';

// In-memory cache of successfully decoded image URLs so re-mounts / route switches render in 0ms
const LOADED_IMAGE_URLS = new Set<string>();

/**
 * Preload critical images into browser cache & memory set during idle time or startup.
 */
export function preloadCriticalImages(urls: string[]): void {
  if (typeof window === 'undefined') return;
  for (const url of urls) {
    if (!url || LOADED_IMAGE_URLS.has(url)) continue;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      LOADED_IMAGE_URLS.add(url);
    };
    img.src = url;
  }
}

export interface OptimizedImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  webpSrc?: string;
  avifSrc?: string;
  srcSet?: string;
  sizes?: string;
  priority?: boolean;
  wrapperClassName?: string;
  aspectRatioClassName?: string;
  preserveNaturalRatio?: boolean;
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/assets/aistudio/history-hero.png',
  webpSrc,
  avifSrc,
  srcSet,
  sizes,
  priority = false,
  className = '',
  wrapperClassName = '',
  aspectRatioClassName = '',
  preserveNaturalRatio = false,
  style,
  ...rest
}: OptimizedImageProps) {
  const normalizedSrc = src.startsWith('/src/assets/images/')
    ? src.replace('/src/assets/images/', '/assets/images/')
    : src;

  const [currentSrc, setCurrentSrc] = useState<string>(normalizedSrc);
  const [isLoaded, setIsLoaded] = useState<boolean>(() =>
    LOADED_IMAGE_URLS.has(normalizedSrc)
  );
  const [hasFailed, setHasFailed] = useState<boolean>(false);

  useEffect(() => {
    const nextUrl = src.startsWith('/src/assets/images/')
      ? src.replace('/src/assets/images/', '/assets/images/')
      : src;
    setCurrentSrc(nextUrl);
    setHasFailed(false);
    if (LOADED_IMAGE_URLS.has(nextUrl)) {
      setIsLoaded(true);
    }
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    LOADED_IMAGE_URLS.add(currentSrc);
    setIsLoaded(true);
    rest.onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!hasFailed && fallbackSrc && currentSrc !== fallbackSrc) {
      setHasFailed(true);
      setCurrentSrc(fallbackSrc);
      setIsLoaded(true);
    } else {
      setIsLoaded(true);
    }
    rest.onError?.(e);
  };

  const imgElement = (
    <picture className="contents">
      {avifSrc && !hasFailed && <source srcSet={avifSrc} type="image/avif" />}
      {webpSrc && !hasFailed && <source srcSet={webpSrc} type="image/webp" />}
      <img
        {...rest}
        src={currentSrc}
        srcSet={!hasFailed ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          ...style,
          imageRendering: 'auto',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }}
        className={`${
          preserveNaturalRatio ? 'object-contain' : 'object-cover'
        } transition-opacity duration-300 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </picture>
  );

  if (!wrapperClassName && !aspectRatioClassName) {
    return imgElement;
  }

  return (
    <div
      className={`relative overflow-hidden bg-[#0B1626] ${aspectRatioClassName} ${wrapperClassName}`}
    >
      {!isLoaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0B1626] via-[#152742] to-[#0B1626] animate-pulse"
        />
      )}
      {imgElement}
    </div>
  );
});
