"use client";

import { useState } from "react";
import Image from "next/image";

type CropImageProps = {
  src?: string;
  alt: string;
  cropLabel: string;
  width?: number;
  height?: number;
  className?: string;
};

export function CropImage({
  src,
  alt,
  cropLabel,
  width = 64,
  height = 64,
  className = "",
}: CropImageProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    console.warn(`[CropImage] Fallback loaded for "${cropLabel}" - image missing: ${src}`);
  };

  if (!src || hasError) {
    // Fallback: gradient badge with crop label
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-muted to-background text-center ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
        title={`Image manquante: ${src}`}
      >
        <span className="text-xs font-medium text-muted-foreground line-clamp-2 px-1">
          {cropLabel}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized={true}
      className={className}
      onError={handleError}
    />
  );
}
