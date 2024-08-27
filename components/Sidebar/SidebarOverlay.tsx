import React from 'react';

interface SidebarOverlayProps {
  onClick: () => void;
}

const SidebarOverlay: React.FC<SidebarOverlayProps> = ({ onClick }) => (
  <div
    className='fixed inset-0 z-40 bg-gray-900/50'
    onClick={onClick}
    aria-hidden='true'
  ></div>
);

export default SidebarOverlay;
