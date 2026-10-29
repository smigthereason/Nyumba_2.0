'use client';

import { useState } from 'react';

/**
 * Retry gallery photos in order, then show a local fallback if every URL fails.
 * Applies to real and demo listings without changing stored property images.
 */
export function ListingImage({ images, title }: { images: string[]; title: string }) {
  // Derive the image index from the current gallery. When the listing changes,
  // the next render starts at its first photo without synchronously setting
  // state in an effect (which violates react-hooks/set-state-in-effect).
  const galleryKey = JSON.stringify(images);
  const [attempt, setAttempt] = useState({ galleryKey, index: 0 });
  const photoIndex = attempt.galleryKey === galleryKey ? attempt.index : 0;
  const src = images[photoIndex] || '/property-placeholder.svg';

  return (
    <img
      src={src}
      alt={title}
      className="h-full w-full object-cover"
      loading="lazy"
      onError={() => {
        if (photoIndex < images.length) {
          setAttempt({ galleryKey, index: photoIndex + 1 });
        }
      }}
    />
  );
}
