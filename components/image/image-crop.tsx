'use client';

import { CloudUpload, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';

import { getCroppedImg } from '@/lib/image/canvas';
import { compressImage } from '@/lib/image/compress-image';
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
  const t = useTranslations('profile-image-modal');
  const [imageSrc, setImageSrc] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState([1]);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const processImageFile = async (file: File) => {
    try {
      const imageDataUrl = await compressImage(file, readFile);
      setImageSrc(imageDataUrl as string);
    } catch (error) {
      console.error('[FILE_CHANGE_ERROR]', error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const imageFile = e.target.files[0];
      await processImageFile(imageFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const imageFile = e.dataTransfer.files[0];

      if (imageFile.type.startsWith('image/')) {
        await processImageFile(imageFile);
      }
    }
  };

  const handleReset = () => {
    setImageSrc('');
    setCrop({ x: 0, y: 0 });
    setZoom([1]);
    setCroppedAreaPixels(null);
  };

  return (
    <div className="space-y-4">
      {imageSrc ? (
        <>
          <div className="relative w-full h-[280px] sm:h-[320px] rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 touch-none">
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
          <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('zoom')}
              </span>
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded min-w-[42px] text-center">
                {zoom[0].toFixed(1)}x
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">1x</span>
              <Slider
                value={zoom}
                onValueChange={(zoom) => setZoom(zoom)}
                min={1}
                max={3}
                step={0.1}
                className="flex-1 touch-none"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">3x</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isFetching}
              className="w-full sm:flex-1 min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('changeImage')}
            </Button>
            <Button
              color="primary"
              disabled={isFetching}
              isLoading={isFetching}
              onClick={showCroppedImage}
              className="w-full sm:flex-1 min-h-[44px]"
            >
              {buttonLabel ?? 'Update'}
            </Button>
          </div>
        </>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative flex flex-col items-center justify-center w-full min-h-[240px] sm:min-h-[280px] 
            border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
            ${
              isDragging
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20 scale-[1.02]'
                : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/10'
            }
          `}
        >
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-3 sm:gap-4 pointer-events-none px-4">
            <div
              className={`p-3 sm:p-4 rounded-full transition-all duration-200 ${isDragging ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}
            >
              <CloudUpload
                className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-200 ${isDragging ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
              />
            </div>
            <div className="text-center">
              <p className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                {uploadLabel ?? t('upload')}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-2">
                {t('clickToSelect')}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 sm:mt-3">JPG, PNG, GIF</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
