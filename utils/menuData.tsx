import { handleLogout } from '@/app/actions';
import {
  IconAddCircleOutline,
  IconBxErrorCircle,
  IconCalendarDays,
  IconClipboard,
  IconCopy,
  IconDatabaseBackup,
  IconGroup,
  IconLogOut,
  IconMapPin,
  IconNoteText,
  IconQuestionCircle,
  IconSetting,
  IconUsers,
  IconWrench,
} from './Icons';
import ROUTES, { MENUITEM, getAuthKeyFromPath, getBaseUrl } from './utils';
import { showToast } from '@/components/Toast';
import moment from 'moment';
import { downloadFile } from '@/hooks/api';
import { API_ENDPOINTS } from './apiConfig';

// Function to handle logout
const logout = async () => {
  // Clear localStorage
  // Clear cookies
  if (window) {
    const basePath = getBaseUrl(window.location.pathname);
    const type = getAuthKeyFromPath(window.location.pathname);
    localStorage.removeItem(`${type}_user_info`);
    await handleLogout(basePath);
    window.location.replace(`/${basePath}/login`);
  }
};

const PBAdminMenu = [
  {
    label: MENUITEM.COMPLAINTS,
    href: ROUTES.DASHBOARD,
    icon: <IconClipboard className='h-5 w-5' />,
  },
  {
    label: MENUITEM.CUSTOMERS,
    href: ROUTES.CUSTOMERS,
    icon: <IconGroup className='h-5 w-5' />,
  },
  {
    label: 'Technicians',
    href: ROUTES.TECHNICIANS,
    icon: <IconWrench className='h-5 w-5' />,
  },
  // {
  //   label: MENUITEM.UNVERUFIED_TECHNICIANS,
  //   href: ROUTES.UNVERUFIED_TECHNICIANS,
  //   icon: <IconWrench className='h-5 w-5' />,
  // },
  {
    label: 'Partners',
    href: ROUTES.PARTNERS,
    icon: <IconUsers className='w-6' />,
  },
  {
    label: 'Add New Users',
    href: ROUTES.ADD_USERS,
    icon: <IconAddCircleOutline className='h-5 w-5' />,
  },
  {
    label: MENUITEM.USER_TYPE,
    href: ROUTES.USER_TYPE,
    icon: <IconGroup className='h-5 w-5' />,
  },
  {
    type: 'separator',
    label: '',
    href: '#',
  },
  {
    label: MENUITEM.ADMIN_REPORT,
    href: ROUTES.ADMIN_REPORT,
    icon: <IconNoteText className='h-5 w-5' />,
  },
  {
    label: MENUITEM.TECHNICIAN_REPORT,
    href: ROUTES.TECHNICIAN_REPORT,
    icon: <IconNoteText className='h-5 w-5' />,
  },
  {
    type: 'separator',
    label: '',
    href: '#',
  },
  {
    label: 'Manage Geography',
    href: ROUTES.MANAGE_GEOGRAPHY,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'Manage Brand',
    href: ROUTES.MANAGE_BRAND,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'Machine Type',
    href: ROUTES.MACHINE_TYPE,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'Machine Variant',
    href: ROUTES.MACHINE_VARIANT,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'Manage Skills',
    href: ROUTES.MANAGE_SKILLS,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'Manage Grades',
    href: ROUTES.MANAGE_GRADES,
    icon: <IconSetting className='h-5 w-5' />,
  },
  // {
  //   label: 'Manage User Type',
  //   href: ROUTES.MANAGE_USER_TYPE,
  //   icon: <IconSetting className='h-5 w-5' />,
  // },
  {
    label: 'Manage Complaint Type',
    href: ROUTES.MANAGE_COMPLAINT_TYPE,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'Manage Complaint Status',
    href: ROUTES.MANAGE_COMPLAINT_STATUS,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'Manage Action Check List',
    href: ROUTES.MANAGE_ACTION_CHECKLIST,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'Manage Service Action',
    href: ROUTES.MANAGE_SERVICE_ACTION,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'Manage Spare Parts',
    href: ROUTES.MANAGE_SPARE_PARTS,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'Manage Machine Model',
    href: ROUTES.MANAGE_MACHINE_MODEL,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'Manage AMC',
    href: ROUTES.MANAGE_AMC,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'Manage Settings',
    href: ROUTES.MANAGE_SETTINGS,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'Restore Customer',
    href: ROUTES.RESTORE_CUSTOMER,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'About Us',
    href: ROUTES.ABOUT_US,
    icon: <IconBxErrorCircle className='h-5 w-5' />,
    external: true,
  },
  {
    label: 'FAQs',
    href: ROUTES.FAQS,
    icon: <IconQuestionCircle className='h-5 w-5' />,
    external: true,
  },
  {
    label: 'Terms of Use',
    href: ROUTES.TERMS_OF_USE,
    icon: <IconCopy className='h-5 w-5' />,
    external: true,
  },
  {
    label: 'Log Out',
    href: '#',
    onClick: () => logout(), // Add this line to handle click
    icon: <IconLogOut className='h-5 w-5' />,
  },
];

const PBPartnerMenu = [
  {
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: <IconClipboard className='h-5 w-5' />,
  },
  {
    label: 'Map View',
    href: 'map-view',
    icon: <IconMapPin className='h-5 w-5' />,
  },
  {
    label: 'Customers',
    href: ROUTES.CUSTOMERS,
    icon: <IconGroup className='h-5 w-5' />,
  },
  {
    label: 'Technicians',
    href: ROUTES.TECHNICIANS,
    icon: <IconWrench className='h-5 w-5' />,
  },
  {
    label: 'Calendar',
    href: ROUTES.MANAGE_CALENDAR,
    icon: <IconCalendarDays className='h-5 w-5' />,
  },
  {
    label: 'AMC Reminder',
    href: ROUTES.AMC_REMINDER,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'AMC Plans',
    href: ROUTES.AMC_PLANS,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'Add New Admin',
    href: ROUTES.ADD_USERS,
    icon: <IconClipboard className='h-6 w-6' />,
  },
  {
    label: 'User Type',
    href: ROUTES.USER_TYPE,
    icon: <IconGroup className='h-5 w-5' />,
  },
  {
    label: 'Preventive Services',
    href: ROUTES.PREVENTIVE_SERVICES,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'Past Complaints',
    href: ROUTES.PAST_COMPLAINTS,
    icon: <IconClipboard className='h-5 w-5' />,
  },
  {
    label: 'Service Report',
    href: ROUTES.MANAGE_SERVICE_REPORT,
    icon: <IconNoteText className='h-5 w-5' />,
  },
  {
    type: 'separator',
    label: '',
    href: '#',
  },
  {
    label: 'Admin Report',
    href: ROUTES.ADMIN_REPORTS,
    icon: <IconNoteText className='h-5 w-5' />,
  },
  {
    label: 'Technician Report',
    href: ROUTES.TECHNICIAN_REPORT,
    icon: <IconNoteText className='h-5 w-5' />,
  },
  {
    label: 'Customer Report',
    href: ROUTES.CUSTOMER_REPORTS,
    icon: <IconNoteText className='h-5 w-5' />,
  },
  {
    type: 'separator',
    label: '',
    href: '#',
  },
  {
    label: MENUITEM.IMPORT_CUSTOMER,
    href: ROUTES.IMPORT_CUSTOMER,
    icon: <IconGroup className='h-5 w-5' />,
  },
  {
    label: MENUITEM.IMPORT_TECHNICIANS,
    href: ROUTES.IMPORT_TECHNICIANS,
    icon: <IconWrench className='h-5 w-5' />,
  },
  {
    label: MENUITEM.IMPORT_DERVICE,
    href: ROUTES.IMPORT_DEVICES,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    type: 'separator',
    label: 'Import Separator',
    href: '#',
  },
  {
    label: MENUITEM.REQUEST_DATA_BACKUP,
    href: '#',
    icon: <IconDatabaseBackup className='h-5 w-5' />,
  },
  {
    type: 'separator',
    label: 'Request Backup Separator',
    href: '#',
  },
  {
    label: 'About Us',
    href: ROUTES.ABOUT_US,
    icon: <IconBxErrorCircle className='h-5 w-5' />,
    external: true,
  },
  {
    label: 'FAQs',
    href: ROUTES.FAQS,
    icon: <IconQuestionCircle className='h-5 w-5' />,
    external: true,
  },
  {
    label: 'Terms of Use',
    href: ROUTES.TERMS_OF_USE,
    icon: <IconCopy className='h-5 w-5' />,
    external: true,
  },
  {
    label: 'Log Out',
    href: '#',
    onClick: () => logout(), // Add this line to handle click
    icon: <IconLogOut className='h-5 w-5' />,
  },
];

const PBEnterprise = [
  {
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: <IconClipboard className='h-5 w-5' />,
  },
  {
    label: 'Customers',
    href: ROUTES.CUSTOMERS,
    icon: <IconGroup className='h-5 w-5' />,
  },
  {
    label: 'Calendar',
    href: ROUTES.MANAGE_CALENDAR,
    icon: <IconCalendarDays className='h-5 w-5' />,
  },
  {
    label: 'AMC Reminder',
    href: ROUTES.AMC_REMINDER,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'AMC Plans',
    href: ROUTES.AMC_PLANS,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'User Type',
    href: ROUTES.USER_TYPE,
    icon: <IconGroup className='h-5 w-5' />,
  },
  {
    label: 'Preventive Services',
    href: ROUTES.PREVENTIVE_SERVICES,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    label: 'Past Complaints',
    href: ROUTES.PAST_COMPLAINTS,
    icon: <IconClipboard className='h-5 w-5' />,
  },
  {
    type: 'separator',
    label: '',
    href: '#',
  },
  {
    label: 'Admin Report',
    href: ROUTES.ADMIN_REPORT,
    icon: <IconNoteText className='h-5 w-5' />,
  },
  {
    label: 'Technician Report',
    href: ROUTES.TECHNICIAN_REPORT,
    icon: <IconNoteText className='h-5 w-5' />,
  },
  {
    label: 'Customer Report',
    href: ROUTES.CUSTOMER_REPORTS,
    icon: <IconNoteText className='h-5 w-5' />,
  },
  {
    label: 'Consolidated Partner Report',
    href: '#',
    icon: <IconNoteText className='h-5 w-5' />,
  },
  {
    label: 'Spare Parts Report',
    href: ROUTES.SPARE_PARTS_REPORT,
    icon: <IconNoteText className='h-5 w-5' />,
  },
  {
    type: 'separator',
    label: '',
    href: '#',
  },
  {
    label: MENUITEM.IMPORT_CUSTOMER,
    href: ROUTES.IMPORT_CUSTOMER,
    icon: <IconGroup className='h-5 w-5' />,
  },
  {
    label: MENUITEM.IMPORT_DERVICE,
    href: ROUTES.IMPORT_DEVICES,
    icon: <IconSetting className='h-5 w-5' />,
  },
  {
    type: 'separator',
    label: '',
    href: '#',
  },
  {
    label: 'About Us',
    href: ROUTES.ABOUT_US,
    icon: <IconBxErrorCircle className='h-5 w-5' />,
    external: true,
  },
  {
    label: 'FAQs',
    href: ROUTES.FAQS,
    icon: <IconQuestionCircle className='h-5 w-5' />,
    external: true,
  },
  {
    label: 'Terms of Use',
    href: ROUTES.TERMS_OF_USE,
    icon: <IconCopy className='h-5 w-5' />,
    external: true,
  },
  {
    label: 'Log Out',
    href: '#',
    onClick: () => logout(), // Add this line to handle click
    icon: <IconLogOut className='h-5 w-5' />,
  },
];

const Enterprise = [
  {
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: <IconClipboard className='h-5 w-5' />,
  },
  {
    label: 'Customers',
    href: ROUTES.CUSTOMERS,
    icon: <IconGroup className='h-5 w-5' />,
  },
  {
    label: 'About Us',
    href: ROUTES.ABOUT_US,
    icon: <IconBxErrorCircle className='h-5 w-5' />,
    external: true,
  },
  {
    label: 'FAQs',
    href: ROUTES.FAQS,
    icon: <IconQuestionCircle className='h-5 w-5' />,
    external: true,
  },
  {
    label: 'Terms of Use',
    href: ROUTES.TERMS_OF_USE,
    icon: <IconCopy className='h-5 w-5' />,
    external: true,
  },
  {
    label: 'Log Out',
    href: '#',
    onClick: () => logout(), // Add this line to handle click
    icon: <IconLogOut className='h-5 w-5' />,
  },
];

export { PBAdminMenu, PBPartnerMenu, PBEnterprise, Enterprise };
