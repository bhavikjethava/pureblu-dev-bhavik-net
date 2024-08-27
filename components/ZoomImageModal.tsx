import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';
import Loader from './Loader';
import { DownloadIcon, LoaderIcon, MinusIcon, PlusIcon, RefreshCwIcon, XIcon } from 'lucide-react';
import { Button } from './ui/button';
import ROUTES, { getBaseUrl } from '@/utils/utils';
import { usePathname } from 'next/navigation';
import {
  IconDownload,
  IconLoading,
  IconMinus,
  IconRefresh,
} from '@/utils/Icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ZoomImageModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  imageSrc: string;
}

const ZoomImageModal: React.FC<ZoomImageModalProps> = ({
  isOpen,
  onRequestClose,
  imageSrc,
}) => {
  const [isLoading, setLoading] = useState(false);
  const [scale, setScale] = useState<number>(1); // State for image scale
  const [isDragging, setDragging] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const pathName = usePathname();
  const basePath = getBaseUrl(pathName);
  const isPBPartner = basePath == ROUTES.PBPARTNER;

  // Reset the image when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const downloadImage = async () => {
    try {
      setLoading(true);
      const fileName = imageSrc?.replace(/^.*[\\/]/, '');
      const response = await fetch(
        `/api/download-image?url=${encodeURIComponent(imageSrc)}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Failed to download file:', error);
    } finally {
      setLoading(false);
    }
  };

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.25, 3)); // Limit zoom-in to 3x
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.25, 1)); // Limit zoom-out to 1x (original size)
  };

  const resetZoomAndPosition = () => {
    setScale(1); // Reset scale to the original size
    setPosition({ x: 0, y: 0 }); // Reset position to the original center
  };

  const startDragging = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
  };

  const stopDragging = () => {
    setDragging(false);
  };

  const handleDragging = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const newX = position.x + event.movementX;
      const newY = position.y + event.movementY;

      setPosition({ x: newX, y: newY });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onRequestClose}>
      <DialogContent className='flex h-full max-h-[80%] max-w-3xl flex-col gap-0 p-0'>
        <DialogHeader
          className={`${
            isPBPartner ? 'bg-pbHeaderBlue' : 'bg-pbHeaderRed'
          } z-40 rounded-tl-lg rounded-tr-lg px-4 py-6 text-primary-foreground`}
        >
          <div className='flex items-center justify-end gap-4' >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={zoomOut}
                    className='p-0'
                    tabIndex={-1}
                  >
                    <MinusIcon className='h-5 w-5' />
                    <span className='sr-only'>Zoom out</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom out</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={zoomIn}
                    className='p-0'
                    tabIndex={-1}
                  >
                    <PlusIcon className='h-5 w-5' />
                    <span className='sr-only'>Zoom in</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom in</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={resetZoomAndPosition}
                    className='p-0'
                    tabIndex={-1}
                  >
                    <RefreshCwIcon className='h-5 w-5' />
                    <span className='sr-only'>Reset</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={downloadImage}
                    disabled={isLoading}
                    className='p-0'
                    tabIndex={-1}
                  >
                    {isLoading ? (
                      <IconLoading className='h-5 w-5' />
                    ) : (
                      <DownloadIcon className='h-5 w-5' />
                    )}

                    <span className='sr-only'>Download</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download</TooltipContent>
              </Tooltip>
              <div>
                <Button size='icon' variant='ghost' onClick={onRequestClose} tabIndex={1}>
                  <XIcon className='h-5 w-5' />
                  <span className='sr-only'>Close</span>
                </Button>
              </div>
            </TooltipProvider>
          </div>
        </DialogHeader>
        <div className='relative h-full w-full overflow-hidden'>
          <div
            ref={imageContainerRef}
            onMouseDown={startDragging}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
            onMouseMove={handleDragging}
            style={{
              cursor:  'grab',
            }}
            className='absolute left-0 top-0 h-full w-full'
          >
            <Image
              src={imageSrc}
              alt=''
              width={1024}
              height={600}
              className='h-full w-full object-contain'
              style={{
                transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ZoomImageModal;
