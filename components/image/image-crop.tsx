'use client';

import imageCompression from 'browser-image-compression';
import { ImagePlus } from 'lucide-react';
import { useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';

import { getCroppedImg } from '@/lib/image/canvas';
import { readFile } from '@/lib/utils';

import { Button } from '../ui';
import { Slider } from '../ui/slider';

type ImageCropProps = {
  buttonLabel?: string;
  callback?: (args: { blob?: string | null; error?: string }) => Promise<void>;
  isFetching?: boolean;
  uploadLabel?: string;
};

export const ImageCrop = ({ buttonLabel, callback, isFetching, uploadLabel }: ImageCropProps) => {
  const [imageSrc, setImageSrc] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState([1]);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleCropComplete = (_: unknown, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const showCroppedImage = async () => {
    try {
      if (croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);

        await callback?.({ blob: croppedImage });
      }
    } catch (error) {
      callback?.({ error: String(error) });
      console.error(['IMAGE_CROP_ERROR'], error);
    }
  };

  const handleFileChange = async (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const imageFile = e.target.files[0];

      console.log('originalFile instanceof Blob', imageFile instanceof Blob); // true
      console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);
      console.log(imageFile);

      try {
        const compressedFile = await imageCompression(imageFile, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
        console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
        console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB
        console.log(compressedFile);

        const imageDataUrl = await readFile(compressedFile);
        setImageSrc(imageDataUrl as string);
      } catch (error) {
        console.log('[FILE_CHANGE_ERROR]', error);
      }
    }
  };

  return (
    <div>
      {imageSrc ? (
        <div className="flex flex-col gap-y-4 bg-transparent">
          <div className="relative w-full h-[200px] rounded-sm">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom[0]}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={(value) => setZoom([value])}
            />
          </div>
          <Slider onValueChange={(zoom) => setZoom(zoom)} min={1} max={3} step={0.03} />
          <Button
            className="mt-4"
            color="primary"
            disabled={isFetching}
            isLoading={isFetching}
            onClick={showCroppedImage}
          >
            {buttonLabel ?? 'Update'}
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition duration-200 border-blue-400 bg-blue-50 hover:border-blue-600 hover:bg-blue-100 dark:border-blue-600 dark:bg-gray-800 dark:hover:border-blue-400 dark:hover:bg-gray-700">
          <div className="flex flex-col items-center">
            <ImagePlus className="w-6 h-6 text-blue-400 dark:text-blue-300 mb-2" />
            <span className="text-blue-500 dark:text-blue-300 font-semibold">
              {uploadLabel ?? 'Upload'}
            </span>
          </div>
          <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
        </label>
      )}
    </div>
  );
};
