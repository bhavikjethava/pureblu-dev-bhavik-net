import React from 'react';
import { Logo } from '../Logo';
import SidebarMenu from './SidebarMenu';
import MenuToggleIcon from '../MenuToggleIcon';
import SidebarHeader from './SidebarHeader';
import SidebarOverlay from './SidebarOverlay';

interface SidebarProps {
  isOpen: boolean;
  className: string;
  toggleSidebarMenu: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebarMenu,
  className,
}) => {
  const closeSidebar = () => {
    // Call the toggleSidebarMenu function to close the sidebar
    toggleSidebarMenu();
  };

  return (
    <>
      {/* Sidebar container */}
      <div
        className={`sidebarMenu fixed bottom-0 left-0 top-0 z-50 h-full w-[300px] overflow-hidden transition-transform duration-100 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar content */}
        <div
          className={`relative z-50 h-full max-w-[300px] ${className} px-4 duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Sidebar header */}
          <SidebarHeader
            toggleSidebarMenu={toggleSidebarMenu}
            isOpen={isOpen}
          />

          {/* Sidebar menu content */}
          <div className='h-full pb-9 pt-5'>
            <SidebarMenu closeSidebar={closeSidebar} />
          </div>
        </div>
      </div>

      {/* Overlay component for background when the sidebar is open */}
      {isOpen && <SidebarOverlay onClick={toggleSidebarMenu} />}
    </>
  );
};

export default Sidebar;
