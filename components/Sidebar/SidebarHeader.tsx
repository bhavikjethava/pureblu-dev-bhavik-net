import React, { useContext, useEffect, useState } from 'react';
import MenuToggleIcon from '../MenuToggleIcon';
import { Logo } from '../Logo';
import { usePathname } from 'next/navigation';
import ROUTES, {
  AUTH,
  HELPERSDATA,
  getAuthKeyFromBasePath,
  getBaseUrl,
} from '@/utils/utils';
import AddPartner from '../Partner/addPartners';
import { DataContext } from '@/context/dataProvider';
import { HEADERDATA } from '@/utils/utils';
import { useAccessRights } from '@/hooks/useAccessRights';

interface SidebarHeaderProps {
  toggleSidebarMenu: () => void; // Function to toggle the sidebar
  isOpen: boolean; // State indicating whether the sidebar is open
}

interface UserData {
  name: string;
  first_name?: string;
  last_name?: string;
  partner?: any;
  // Add more properties as needed
}

interface FormData {
  [key: string]: any;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  toggleSidebarMenu,
  isOpen,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState();
  const [helperData, setHelperData] = useState<{ [key: string]: any }>({});
  const [userData, setUserData] = useState<UserData | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saveLoading, setLoading] = useState(false);
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const type = getAuthKeyFromBasePath(basePath);
  const isPBPartner = basePath == ROUTES.PBPARTNER;
  const { state, setData } = useContext(DataContext);
  const { isAccess } = useAccessRights();

  useEffect(() => {
    if (isPBPartner) {
      const storedUserData = localStorage.getItem(`${type}_user_info`);
      if (storedUserData) {
        const formatedUser = JSON.parse(storedUserData);
        setUserData(formatedUser);
        const partnerInfo = formatedUser.partner;
        partnerInfo['user'] = formatedUser;
        setSelectedPartner(partnerInfo);
      }
    }
  }, []);

  useEffect(() => {
    if (isPBPartner) {
      if (state?.[HELPERSDATA]) {
        setHelperData(state?.[HELPERSDATA]);
      }
    }
  }, [state?.[HELPERSDATA]]);

  const onEditPrfile = () => {
    toggleSidebarMenu();
    setShowModal(true);
  };

  const handleSave = (formData: FormData) => {
    if (formData.isError) {
      setErrors(formData.errors);
    } else if (formData.response) {
      const type = AUTH.PBPARTNER;
      const resp = {
        ...formData.response.data,
        ...formData.response.data.user,
      };
      resp['partner'] = formData.response.data;
      localStorage.setItem(`${type}_user_info`, JSON.stringify(resp));
      setSelectedPartner(resp);
      setData({ [HEADERDATA]: formData.response.data });
      setShowModal(false);
    }
  };

  const handleInputChange = (key: string, value: string | number | File) => {
    // setSelectedPartner((preData: any) => {
    //   return {
    //     // ...preData,
    //     [key]: value,
    //   };
    // });
    setErrors((prevError) => {
      return {
        ...prevError,
        [key.replace(/\[(\w+)\]/, '.$1')]: '',
      };
    });
  };

  return (
    <div className='flex h-[66px] items-center gap-5 border-b'>
      {/* Toggle button */}
      <MenuToggleIcon onClick={toggleSidebarMenu} isOpen={isOpen} />
      {/* Logo */}
      <Logo className='text-white' />
      {isPBPartner && isAccess && (
        <div onClick={onEditPrfile}>
          <span className='text-white cursor-pointer'>Edit Profile</span>
        </div>
      )}
      {showModal && (
        <AddPartner
          open={showModal}
          data={selectedPartner}
          onSave={handleSave}
          helperData={helperData}
          formErrors={errors}
          isPBPartner={isPBPartner}
          onInputChange={handleInputChange} // Pass the handleInputChange function as a prop
          onClose={() => {
            setShowModal(false);
          }} // Set onClose to a function that sets selectedRow to null
        />
      )}
    </div>
  );
};

export default SidebarHeader;
