import React from 'react';

interface MenuToggleIconProps {
  onClick: () => void;
  isOpen: boolean;
}

const MenuToggleIcon: React.FC<MenuToggleIconProps> = ({ onClick, isOpen }) => (
  <button
    type='button'
    className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700'
    onClick={onClick}
    aria-label={isOpen ? 'Close menu' : 'Open menu'} // Descriptive label for accessibility
  >
    <span className='sr-only'>{isOpen ? 'Close menu' : 'Open menu'}</span>
    {/* SVG icon with aria-hidden for screen readers */}
    <svg
      className='h-6 w-6 stroke-white'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth='1.5'
      stroke='currentColor'
      aria-hidden='true' // This ensures that the icon is ignored by screen readers
    >
      {isOpen ? (
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M6 18L18 6M6 6l12 12'
        />
      ) : (
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
        />
      )}
    </svg>
  </button>
);

export default MenuToggleIcon;
