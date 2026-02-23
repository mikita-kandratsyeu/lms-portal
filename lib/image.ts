import { getPlaiceholder } from 'plaiceholder';

const NO_PHOTO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f3f4f6"/><g fill="none" stroke="#d1d5db" stroke-width="2"><rect x="140" y="80" width="120" height="90" rx="8"/><circle cx="200" cy="125" r="20"/><path d="M120 200l30-30 20 20 60-60 60 60"/></g><text x="200" y="240" text-anchor="middle" fill="#9ca3af" font-size="18" font-family="system-ui,sans-serif">No photo</text></svg>`;

export const NO_PHOTO_PLACEHOLDER = `data:image/svg+xml;base64,${Buffer.from(NO_PHOTO_SVG).toString('base64')}`;

export const getImagePlaceHolder = async (path: string) => {
  try {
    const res = await fetch(path);

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
