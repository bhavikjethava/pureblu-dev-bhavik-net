// components/SidebarMenu.tsx
import Link from 'next/link';
import { Separator } from '../ui/separator';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '../ui/scroll-area';
import {
  AUTH,
  MENUITEM,
  getAuthKeyFromBasePath,
  getBaseUrl,
} from '@/utils/utils';
import {
  Enterprise,
  PBAdminMenu,
  PBEnterprise,
  PBPartnerMenu,
} from '@/utils/menuData';
import { useContext, useEffect, useState } from 'react';
import { API_ENDPOINTS, API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import { apiCall, downloadFile } from '@/hooks/api';
import { useMutation } from 'react-query';
import { DataContext } from '@/context/dataProvider';
import { showToast } from '../Toast';
import moment from 'moment';
import { IconBxErrorCircle } from '@/utils/Icons';
import { useAccessRights } from '@/hooks/useAccessRights';

interface MenuItem {
  label: string;
  href: string;
  type?: string; // Optional type for separators
  icon?: React.ReactNode; // Allow for custom icons
  onClick?: () => void; // Add onClick property
  external?: boolean; // Add external property to indicate external links
}

interface SidebarMenuProps {
  closeSidebar: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ closeSidebar }) => {
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const dynamicURL = `/${basePath}/dashboard`;
  const apiAction = useMutation(apiCall);
  const { setData } = useContext(DataContext);
  const { isAccess } = useAccessRights();
  const [menu, setMenu] = useState<any>(PBAdminMenu);

  useEffect(() => {
    const type = getAuthKeyFromBasePath(basePath);
    // menu
    switch (type) {
      case AUTH.PBADMIN: {
        if (!isAccess) {
          const includeMenuList = [
            MENUITEM.COMPLAINTS,
            MENUITEM.CUSTOMERS,
            MENUITEM.USER_TYPE,
            MENUITEM.ADMIN_REPORT,
            MENUITEM.TECHNICIAN_REPORT,
            MENUITEM.SEPARATOR,
            MENUITEM.ABOUT_US,
            MENUITEM.FAQS,
            MENUITEM.TERMS_OF_USE,
            MENUITEM.LOG_OUT,
          ];
          const filterMenu = PBAdminMenu.filter(
            (menuItem: any) => includeMenuList.includes(menuItem.label)
          );

          setMenu(filterMenu);
        } else {
          setMenu(PBAdminMenu);
        }
        break;
      }
      case AUTH.PBPARTNER: {
        if (!isAccess) {
          const excludeMenuList = [
            MENUITEM.REQUEST_DATA_BACKUP,
            MENUITEM.REQUEST_DATA_BACKUP_SEPARATOR,
            MENUITEM.IMPORT_CUSTOMER,
            MENUITEM.IMPORT_TECHNICIANS,
            MENUITEM.IMPORT_DERVICE,
            MENUITEM.IMPORT_SEPARATOR,
          ];
          const filterMenu = PBPartnerMenu.filter(
            (menuItem: any) => !excludeMenuList.includes(menuItem.label)
          );

          setMenu(filterMenu);
        } else {
          setMenu(PBPartnerMenu);
        }
        break;
      }
      case AUTH.PBENTERPRISE: {
        setMenu(PBEnterprise);
        break;
      }
      case AUTH.ENTERPRISE: {
        setMenu(Enterprise);
        break;
      }
    }
  }, [isAccess]);

  const handleMenuLinkClick = (item: any) => {
    // Call the closeSidebar function to close the sidebar
    closeSidebar();
    // Additional logic for handling menu link click
    switch (item?.label) {
      case 'Request Data Backup': {
        onRequestBackup();
        break;
      }
      case 'Consolidated Partner Report': {
        downloadConsolidatedPartnerReport();
        break;
      }
    }
  };

  const onRequestBackup = async () => {
    try {
      setData({ isLoading: true });
      const request = {
        endpoint: `${API_ENDPOINTS_PARTNER.REQUEST_BACKUP}`,
        method: 'POST',
      };
      const response = await apiAction.mutateAsync(request);
    } catch (e: any) {
      console.log('status change error', e);
    } finally {
      setData({ isLoading: false });
    }
  };

  const downloadConsolidatedPartnerReport = async () => {
    try {
      setData({ isLoading: true });
      let endpoint: string = `${API_ENDPOINTS.CONSOLIDATE_PARTNER_REPORT}`;
      const blob: Blob = await downloadFile(endpoint);
      const blobUrl: string = window.URL.createObjectURL(blob);
      const a: HTMLAnchorElement = document.createElement('a');
      a.href = blobUrl;
      a.download = `prime_customer_report_${moment(new Date()).format(
        'Y-MM-DD'
      )}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error: any) {
      // Show an alert with the error message
      showToast({
        variant: 'destructive',
        message: error.message,
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
    } finally {
      setData({ isLoading: false });
    }
  };

  return (
    <div className='sidebarMenu flex h-[95%] flex-col overflow-auto '>
      <ScrollArea>
        <ul className='mr-4 text-white'>
          {menu.map((item: MenuItem, index: number) => {
            if (item.type === 'separator') {
              return (
                <li key={index} className='py-3'>
                  <Separator />
                </li>
              );
            }

            if (item.external) {
              return (
                <li key={index} className=''>
                  <a
                    href={item.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-5 py-3 text-sm'
                  >
                    {item.icon} {/* Render the Icon component directly */}
                    {item.label}
                  </a>
                </li>
              );
            }

            const isActive = pathname === `${dynamicURL}/${item.href}`;
            const activeClass = isActive ? 'font-bold' : ''; // Example active class

            return (
              <li key={index} className=''>
                <Link href={`${dynamicURL}/${item.href}`} className='' passHref>
                  <div
                    onClick={() => {
                      handleMenuLinkClick(item);
                      if (item.onClick) {
                        item.onClick();
                      }
                    }}
                    className={`flex items-center gap-5 py-3 text-sm ${activeClass}`}
                  >
                    {item.icon} {/* Render the Icon component directly */}
                    {item.label}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </div>
  );
};

export default SidebarMenu;
