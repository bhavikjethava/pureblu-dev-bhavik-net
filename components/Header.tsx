'use client';
import React, { useContext, useEffect, useState } from 'react';
import { Logo } from './Logo';
import Sidebar from './Sidebar/Sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowDown, ArrowUp } from '@/utils/Icons';
import { Button } from './ui/button';
import MenuToggleIcon from './MenuToggleIcon';
import { handleLogin, handleLogout } from '@/app/actions';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import { DataContext } from '@/context/dataProvider';
import ROUTES, {
  AUTH,
  HELPERSDATA,
  checkUserAuthorization,
  fetchHelperData,
  getAuthKeyFromPath,
  getBaseUrl,
} from '@/utils/utils';
import Image from 'next/image';
import { HEADERDATA } from '@/utils/utils';
import { useCookies } from 'next-client-cookies';
import { getClientCookie } from '@/utils/cookieUtils';

// Add the `className` prop to the HeaderProps interface
interface HeaderProps {
  className?: string;
}

interface UserData {
  name: string;
  first_name?: string;
  last_name?: string;
  partner?: any;
  // Add more properties as needed
}

const Header: React.FC<HeaderProps> = ({ className = 'bg-pbHeaderRed' }) => {
  const pathname = usePathname();
  const router = useRouter();
  const apiAction = useMutation(apiCall);
  const { state, setData } = useContext(DataContext);
  const type = getAuthKeyFromPath(pathname);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loginLoader, setLoginLoader] = useState(false);
  const [isSwitchToSuperAdmin, setBackToSuperAdmin] = useState(false);

  // State for managing the sidebar menu visibility
  const [isSidebarMenuOpen, setSidebarMenuOpen] = useState(false);

  // State for managing the dropdown menu visibility
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const cookies = useCookies();

  // Function to toggle the sidebar menu visibility
  const toggleSidebarMenu = () => {
    setSidebarMenuOpen(!isSidebarMenuOpen);
  };

  useEffect(() => {
    checkAuthorizationWithoutMiddleware();  
  }, []);

  useEffect(() => {
    // Check if user data is in localStorage
    const storedUserData = localStorage.getItem(`${type}_user_info`);
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, [state?.[HEADERDATA]]);

  useEffect(() => {
    const switchToAdmin = localStorage.getItem(`${AUTH.PBADMIN_HOLD}`);
    if (switchToAdmin) {
      setBackToSuperAdmin(true);
    }
    fetchHelper();
  }, []);

  const checkAuthorizationWithoutMiddleware = async () => {
    // check authentication
    let isAuthenticated = await getClientCookie(AUTH.PBPARTNER);
    const basePath = getBaseUrl(pathname);
    switch (basePath) {
      case ROUTES.PBADMIN: {
        isAuthenticated = await getClientCookie(AUTH.PBADMIN);
        break;
      }
      case ROUTES.PBPARTNER: {
        isAuthenticated = await getClientCookie(AUTH.PBPARTNER);
        break;
      }
      case ROUTES.PBENTERPRISE: {
        isAuthenticated = await getClientCookie(AUTH.PBENTERPRISE);
        break;
      }
      case ROUTES.ENTERPRISE: {
        isAuthenticated = await getClientCookie(AUTH.ENTERPRISE);
        break;
      }
    }

    checkUserAuthorization(isAuthenticated, basePath, pathname, router)
  };

  const fetchHelper = async () => {
    const helperData = await fetchHelperData(apiAction);
    setData(helperData);
  };

  // Function to handle logout
  const logout = async () => {
    const basePath = getBaseUrl(pathname);
    // Clear localStorage
    localStorage.removeItem(`${type}_user_info`);

    // Clear cookies
    handleLogout(basePath);
    // Redirect to the login page or any other page

    setTimeout(() => {
      const dynamicURL = `/${basePath}/login`;
      router.push(dynamicURL);
    }, 500);
  };

  const loginAsEnterprise = async () => {
    try {
      setLoginLoader(true);
      const EnterpriseLogin = {
        endpoint: `${API_ENDPOINTS.ENTERPRISE}/login-request`,
        method: 'POST',
      };
      const EnterpriseLoginResponse =
        await apiAction.mutateAsync(EnterpriseLogin);
      if (EnterpriseLoginResponse?.data?.access_token) {
        const params = {
          request_secrete: EnterpriseLoginResponse?.data?.access_token,
        };
        const EnterpriseLogin = {
          endpoint: `${API_ENDPOINTS.ADMIN_LOGIN_AS_ENTERPRISE}`,
          method: 'POST',
          body: params,
        };
        const loginAsEnterpriseResponse =
          await apiAction.mutateAsync(EnterpriseLogin);

        const type = AUTH.PBENTERPRISE;
        localStorage.setItem(
          `${type}_user_info`,
          JSON.stringify(loginAsEnterpriseResponse.data)
        );
        localStorage.setItem(
          `${type}_authToken`,
          loginAsEnterpriseResponse.data.token_info.access_token
        );

        await handleLogin(
          type,
          loginAsEnterpriseResponse.data.token_info.access_token
        );
        setLoginLoader(false);
        let url = `/${ROUTES.PBENTERPRISE}/${ROUTES.DASHBOARD}`;
        window.location.href = url;
        // const newWindow = window.open(url);
        // if (newWindow) newWindow.opener = null;

        // re-name cookies (Login as enterprise)
        localStorage.setItem(AUTH.PBADMIN_HOLD, `${cookies.get(AUTH.PBADMIN)}`);
        cookies.remove(AUTH.PBADMIN);
      } else {
        setLoginLoader(false);
      }
    } catch (e) {
      console.log('===> error', e);
    }
  };

  const switchToSuperAdminPress = () => {
    const token = localStorage.getItem(AUTH.PBADMIN_HOLD);
    localStorage.removeItem(AUTH.PBADMIN_HOLD);
    cookies.set(AUTH.PBADMIN, token || '');
    let url = `/${ROUTES.PBADMIN}/${ROUTES.DASHBOARD}`;
    window.location.href = url;
    cookies.remove(AUTH.PBENTERPRISE);
    cookies.remove(AUTH.PBPARTNER);
  };

  return (
    <header className={`flex min-h-[65px] px-4 ${className}`}>
      {/* Main header content */}
      <div className='flex w-full items-center justify-between gap-5'>
        {/* Left section with toggle button and logo */}
        <div className='flex gap-5'>
          {/* Toggle button for the sidebar */}
          <MenuToggleIcon
            onClick={toggleSidebarMenu}
            isOpen={isSidebarMenuOpen}
          />

          {/* Logo component */}
          <Logo className='text-white' />
        </div>
        <div className='flex items-center'>
          {userData?.partner?.logo ? (
            <Image
              className='h-14 w-auto'
              src={userData?.partner?.logo}
              alt={'Partner logo'}
              height={60}
              width={60}
            />
          ) : null}
          {/* Right section with user dropdown */}
          <div className='text-white'>
            {/* Dropdown menu for user actions */}
            {/* Comment: Button with aria-expanded and aria-haspopup attributes for accessibility */}
            <DropdownMenu onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  className='flex items-center font-normal capitalize focus-visible:outline-none'
                  variant={null}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup='true'
                >
                  {type == AUTH.PBADMIN ||
                  type == AUTH.PBENTERPRISE ||
                  type === AUTH.ENTERPRISE
                    ? userData?.name
                    : `${userData?.first_name || ''} ${
                        userData?.last_name || ''
                      }`}
                  {isDropdownOpen ? (
                    <ArrowUp className='ml-2' />
                  ) : (
                    <ArrowDown className='ml-2' />
                  )}
                </Button>
              </DropdownMenuTrigger>

              {/* Content of the dropdown menu */}
              <DropdownMenuContent align='end'>
                {/* Menu items in the dropdown */}
                {type == AUTH.PBADMIN && (
                  <DropdownMenuItem onClick={loginAsEnterprise}>
                    Login As Enterprise
                  </DropdownMenuItem>
                )}
                {isSwitchToSuperAdmin ? (
                  <DropdownMenuItem onClick={switchToSuperAdminPress}>
                    Switch To Super Admin
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={logout}>Log Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Sidebar component */}
      <Sidebar
        isOpen={isSidebarMenuOpen}
        className={className}
        toggleSidebarMenu={toggleSidebarMenu}
      />
    </header>
  );
};

export default Header;
