'use client';

import Image from 'next/image';
import { useState } from 'react';

import { NO_PHOTO_PLACEHOLDER } from '@/lib/image-placeholders';

type PreviewImageProps = {
  alt: string;
  blurDataURL: string;
  src: string;
};

export const PreviewImage = ({ alt, blurDataURL, src }: PreviewImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <div className="relative w-full min-w-0 aspect-w-16 aspect-h-9 border rounded-lg overflow-hidden shadow-none">
      <Image
        alt={alt}
        blurDataURL={blurDataURL || NO_PHOTO_PLACEHOLDER}
        className="object-cover"
        fill
        onError={() => setImgSrc(NO_PHOTO_PLACEHOLDER)}
        placeholder="blur"
        src={imgSrc}
      />
    </div>
  );
};
