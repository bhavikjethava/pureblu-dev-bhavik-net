import React from 'react';
import Image from 'next/image';
import logoImg from '../public/logo.png';

interface LogoProps {
  alt?: string;
  className?: string;
}

/**
 * Logo component displays an image with alt text.
 */
export const LogoImg: React.FC<LogoProps> = ({ alt }) => {
  return (
    <div className='flex text-4xl font-bold text-primary'>
      {/* 
        Using the 'Image' component from 'next/image' for optimized image loading.
        The 'alt' prop is used for accessibility.
      */}
      <Image
        src={logoImg}
        alt={alt || ''}
        height={160}
        width={160}
        priority // or priority={true}
        className='max-w-32 rounded-sm'
      />
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({ className = 'text-primary ' }) => {
  return (
    <h2 className={`flex text-2xl font-semibold ${className}`}>Pureblu - Testing</h2>
  );
};
