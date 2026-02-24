import { getPlaiceholder } from 'plaiceholder';

import { NO_PHOTO_PLACEHOLDER } from './image-placeholders';

export { NO_PHOTO_PLACEHOLDER } from './image-placeholders';

export const getImagePlaceHolder = async (path: string) => {
  try {
    const normalizedUrl = new URL(path).href;
    const res = await fetch(normalizedUrl);

    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    const plaiceholder = await getPlaiceholder(buffer);

    return { ...plaiceholder, img: { src: path } };
  } catch (error) {
    console.warn('[getImagePlaceHolder]', path, error);

    return {
      base64: NO_PHOTO_PLACEHOLDER,
      img: { src: path, width: 1, height: 1 },
      blurDataURL: NO_PHOTO_PLACEHOLDER,
    };
  }
};
