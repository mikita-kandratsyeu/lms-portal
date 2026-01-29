import imageCompression from 'browser-image-compression';

export const compressImage = async (
  imageFile: File,
  callback?: (file: File) => Promise<string | ArrayBuffer | null>,
): Promise<string | ArrayBuffer | null> => {
  // eslint-disable-next-line no-console
  console.log(`OriginalFile size ${imageFile.size / 1024 / 1024} MB`);

  try {
    const compressedImageFile = await imageCompression(imageFile, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });

    // eslint-disable-next-line no-console
    console.log(`CompressedFile size ${compressedImageFile.size / 1024 / 1024} MB`);

    const imageDataUrl = await callback?.(compressedImageFile);

    return imageDataUrl ?? null;
  } catch (error) {
    console.error('[COMPRESS_IMAGE_ERROR]', error);

    return null;
  }
};
