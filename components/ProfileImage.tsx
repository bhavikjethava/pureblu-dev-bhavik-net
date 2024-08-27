import React, { useState } from 'react';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';

interface ProfileImageProps {
  src: string;
  alt: string;
  height: number;
  width: number;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  src,
  alt,
  height,
  width,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      {isLoading && !src ? (
        <Skeleton
          style={{ width: width, height: height }}
          className='rounded-full'
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          height={height}
          width={width}
          className='h-24 w-24 rounded-full object-cover'
          // style={{ display: isLoading ? 'none' : 'block' }}
          onLoad={handleImageLoad}
        />
      )}
    </div>
  );
};

export default ProfileImage;
