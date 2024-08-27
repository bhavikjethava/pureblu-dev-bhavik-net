import { AUTH, ROLE, getAuthKeyFromPath } from '@/utils/utils';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export const useAccessRights = () => {
  const [isAccess, setAcccess] = useState<boolean>(true);
  const pathname = usePathname();
  const type = getAuthKeyFromPath(pathname);

  useEffect(() => {
    const userData = localStorage.getItem(`${type}_user_info`);
    if (userData) {
      const userInfo = JSON.parse(userData);
      switch (type) {
        case AUTH.PBPARTNER:
          
            if (userInfo?.role?.id !== ROLE.OWNER) {
              setAcccess(false);
            }
          break;
        case AUTH.PBADMIN:
          if (userInfo?.role?.id !== ROLE.SUPER_ADMIN) {
            setAcccess(false);
          }
        default:
          break;
      }
    }

    // if (type === AUTH.PBPARTNER) {
    //   const userData = localStorage.getItem(`${type}_user_info`);
    //   if (userData) {
    //     const userInfo = JSON.parse(userData);
    //     if (userInfo?.role?.id != ROLE.OWNER) {
    //       setAcccess(false);
    //     }
    //   }
    // }
  }, []);

  return { isAccess };
};
