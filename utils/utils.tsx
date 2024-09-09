import Image from 'next/image';
import { IconStar } from './Icons';
import { API_ENDPOINTS } from './apiConfig';
import { downloadFile } from '@/hooks/api';

export interface ArrayProps {
  [key: string]: unknown;
}

export interface OptionType {
  id: number;
  name: string;
}
export interface HelperData {
  data?: any;
  spare_type?: Array<OptionType>;
  spare_type_object?: { [key: string]: string };
  uom?: Array<OptionType>;
  uom_object?: { [key: string]: string };
  capacity_unit?: Array<OptionType>;
  capcityObject?: { [key: string]: string };
  rating?: Array<OptionType>;
  ratingObject?: { [key: string]: string };
}

export interface UserData {
  name?: string;
  first_name?: string;
  full_name?: string;
  last_name?: string;
  partner?: any;
  // Add more properties as needed
}

// context api helper data start
export const HELPERSDATA = 'helpers';
export const HEADERDATA = 'header';
export const BRANCHLIST = 'branchList';
export const DEVICELIST = 'deviceList';
export const REFRESHBRANCHLIST = 'refreshBranchList';
export const REFRESHDIVELIST = 'refreshDeviceList';
export const REFRESHCOMPLAINTLIST = 'refreshComplaintList';
export const REFRESHCOMPLAINDETAIL = 'refreshComplaintDetail';
export const SKILLLIST = 'skillList';
export const STATUSLIST = 'statusList';
export const TECHNICIANLIST = 'technicianList';
export const REFRESH_TECHNICIANLIST = 'refreshTechnicianList';
export const CUSTOMER = 'customer';
export const PARTNERS = 'partners';
export const SERVICEREPORTLIST = 'serviceReportList';
export const REFRESHSERVICEREPORTLIST = 'refreshserviceReportList';
export const REFRESHUNITSERVICELIST = 'refreshUnitHistoryList';
// context api helper data end

export let ISHLPERAPIPENDING = false;
export const TEXTAREA = 'text-area';
export const YYYYMMDD = 'yyyy-MM-DD';
export const DDMMYYYY = 'DD-MM-yyyy';
export const DATE_FORMAT_FULL_DATE_TIME = 'DD MMMM, YYYY   hh:mm A';

export const STATE = 'state';
export const CITY = 'city';
export const DEFAULT_COUNTRY = 91;

export const MAXPHONE = 12;

export const COMPLAIN_STATUS = {
  OPEN: 1,
  RESOLVED: 9,
  ASSIGNED: 3,
  IN_PROGRESS: 4,
  CLOSED: 10,
  CANCELLED: 11,
  WAITING_FOR_PARTS: 6,
  REOPENED: 13,
};
export const ROLE = {
  OWNER: 4,
  SUPER_ADMIN: 1,
};

export const MENUITEM = {
  REQUEST_DATA_BACKUP: 'Request Data Backup',
  REQUEST_DATA_BACKUP_SEPARATOR: 'Request Backup Separator',
  IMPORT_CUSTOMER: 'Import Customers',
  IMPORT_TECHNICIANS: 'Import Technicians',
  IMPORT_DERVICE: 'Import Devices',
  IMPORT_SEPARATOR: 'Import Separator',
  COMPLAINTS: 'Complaints',
  CUSTOMERS: 'Customers',
  USER_TYPE: 'User Type',
  UNVERUFIED_TECHNICIANS: 'Unverified Technicians',
  ADMIN_REPORT: 'Admin Report',
  TECHNICIAN_REPORT: 'Technician Report',
  ABOUT_US: 'About Us',
  FAQS: 'FAQs',
  TERMS_OF_USE: 'Terms of Use',
  LOG_OUT: 'Log Out',
  SEPARATOR: '',
};

export const AUTH = {
  PBADMIN: 'pb_admin',
  PBPARTNER: 'pb_partner',
  PBENTERPRISE: 'pb_enterprise',
  ENTERPRISE: 'enterprise',
  PBADMIN_HOLD: 'pb_admin__',
};

// const for routes
const ROUTES = {
  PBADMIN: 'PBAdmin',
  PBPARTNER: 'PBPartner',
  PBENTERPRISE: 'PBEnterprise',
  ENTERPRISE: 'Enterprise',
  LOGIN: `login`,
  DASHBOARD: '/',
  CUSTOMERS: 'customers',
  TECHNICIANS: 'technician',
  PARTNERS: 'manage-partners',
  PRIME: '#',
  ADD_USERS: 'users',
  USER_TYPE: 'get-user-type',
  UNVERUFIED_TECHNICIANS: 'unverified-technicians',
  PREVENTIVE_SERVICES: 'preventive-services',
  IMPORT_CUSTOMER: 'import-customers',
  IMPORT_TECHNICIANS: 'import-technicians',
  IMPORT_DEVICES: 'import-devices',
  ADMIN_REPORT: 'admin-report',
  TECHNICIAN_REPORT: 'technician-report',
  CUSTOMER_REPORT: '#',
  MANAGE_GEOGRAPHY: 'manage-geography',
  MANAGE_BRAND: 'manage-brand',
  MACHINE_TYPE: 'manage-machine-type',
  MACHINE_VARIANT: 'manage-variant',
  MANAGE_SKILLS: 'manage-skills',
  MANAGE_GRADES: 'manage-grades',
  MANAGE_USER_TYPE: '#',
  MANAGE_COMPLAINT_TYPE: 'manage-complaint-type',
  MANAGE_COMPLAINT_STATUS: 'manage-complaint-status',
  MANAGE_ACTION_CHECKLIST: 'manage-action-checklist',
  MANAGE_SERVICE_ACTION: 'manage-service-action',
  MANAGE_SPARE_PARTS: 'manage-spare-parts',
  MANAGE_MACHINE_MODEL: 'manage-machine-model',
  MANAGE_AMC: 'manage-amc',
  AMC_PLANS: 'amc-plans',
  AMC_REMINDER: 'amc-reminder',
  MANAGE_SETTINGS: 'manage-settings',
  RESTORE_CUSTOMER: 'restore-customer',
  ABOUT_US: 'https://pureblu.in/',
  FAQS: 'https://s3.ap-south-1.amazonaws.com/dashboard-pureblu/uploads/faq/faq.xlsx',
  TERMS_OF_USE: 'https://pureblu.in/legal/',
  LOG_OUT: '#',
  MANAGE_CALENDAR: 'manage-calendar',
  PAST_COMPLAINTS: 'past-complaints',
  MANAGE_SERVICE_REPORT: 'manage-service-report',
  SPARE_PARTS_REPORT: 'spare-parts-report',
  ADMIN_REPORTS: 'admin-report',
  CUSTOMER_REPORTS: 'customer-report',
  SEARCH_SERVICE_REPORTS: 'search-service-report',
};

export default ROUTES;
//end

export const FALLBACKSITE = `${ROUTES.PBPARTNER}/${ROUTES.DASHBOARD}`;
export const FALLBACKLOGIN = `${ROUTES.PBPARTNER}/${ROUTES.LOGIN}`;
export const IMPORTTEMPLATE = {
  CUSTOMERS: 'https://staging.pureblu.in/public/reports/customer_import.xlsx',
  TECHNICIANS:
    'https://staging.pureblu.in/public/reports/technicians_import.xlsx',
  DEVICES: 'https://staging.pureblu.in/public/reports/device_import.xlsx',
};

export const getBaseUrl = (pathName: string) => {
  return pathName.split('/')[1];
};

export const getAuthKeyFromPath = (pathName: string) => {
  const basePath = getBaseUrl(pathName);
  return getAuthKeyFromBasePath(basePath);
};

export const getAuthKeyFromBasePath = (basePath: string) => {
  let type = AUTH.PBADMIN;
  switch (basePath) {
    case ROUTES.PBADMIN: {
      type = AUTH.PBADMIN;
      break;
    }
    case ROUTES.PBPARTNER: {
      type = AUTH.PBPARTNER;
      break;
    }
    case ROUTES.PBENTERPRISE: {
      type = AUTH.PBENTERPRISE;
      break;
    }
    case ROUTES.ENTERPRISE: {
      type = AUTH.ENTERPRISE;
      break;
    }
  }
  return type;
};

export const isPBPartnerUser = (pathName: string) => {
  const basePath = getBaseUrl(pathName);
  return basePath == ROUTES.PBPARTNER;
};

export const isPBEnterpriseUser = (pathName: string) => {
  const basePath = getBaseUrl(pathName);
  return basePath == ROUTES.PBENTERPRISE;
};

export const getStatusString = (status: any): [string, string] => {
  let statusString: string;
  let className: string;

  if (status === 1) {
    statusString = 'Active';
    className = 'var(--pbGreen)';
  } else if (status === 2) {
    statusString = 'Inactive';
    className = 'var(--pbRed)';
  } else if (status === 3) {
    statusString = 'Disabled';
    className = 'var(--pbGeay)';
  } else {
    statusString = 'Inactive';
    className = 'var(--pbRed)';
    // statusString = 'Unknown';
    // className = 'unknown';
  }

  return [statusString, className];
};

export const getAMCServiceStatus = (reuest: any): string => {
  let className: string;

  if (reuest != null) {
    className = 'var(--pbGreen)';
  } else {
    className = 'var(--pbRed)';
  }
  return className;
};

export const ACTIVETECHNICITION = () => {
  let activeTech = [];
  activeTech.push({ id: 0, name: 'Unlimited' });
  for (let i = 1; i < 100; i++) {
    activeTech[i] = { id: i, name: `${i}` };
  }
  return activeTech;
};

export const getAuthTypeFromUrl = (match: any): string => {
  if (match) {
    const matchGroup = match[1].toLowerCase();
    switch (matchGroup) {
      case 'pbadmin':
        return 'adminUser';
      case 'pbpartner':
        return 'partner';
      case 'pbenterprise':
        return 'enterprise';
      case 'enterprise':
        return 'customer';
      default:
        return 'adminUser';
    }
  }

  return 'adminUser';
};

export const getVIPStatus = (val: number) => {
  if (val === 1) {
    return <IconStar />;
  }
  // If the value is not 1, return null or nothing
  return null;
};

export const updateArray = (list: Array<ArrayProps>, item: ArrayProps) => {
  let tempList = list;
  let index = tempList!!.findIndex((x) => x.id == item.id);
  if (index > -1) {
    tempList[index] = item;
  }
  return tempList;
};

export const arrayToObjectConveter = (array: any) => {
  return array.reduce(
    (obj: any, item: any) => Object.assign(obj, { [item.id]: item.name }),
    {}
  );
};

export const deleteArrayItem = (list: Array<ArrayProps>, item: ArrayProps) => {
  return list.filter((obj) => obj.id !== item.id);
};

export const getActiveDeactiveMsg = (status: number, module: string) => {
  return `Do You Really Want to ${
    status == 1 ? 'Deactivate' : 'Activate'
  } This ${module}`;
};

export const fetchHelperData = async (apiAction: any) => {
  if (!ISHLPERAPIPENDING) {
    ISHLPERAPIPENDING = true;
    try {
      const helperResponse = {
        endpoint: API_ENDPOINTS.HELPER_TYPES,
        method: 'GET',
      };

      const helperData = await apiAction.mutateAsync(helperResponse);
      if (helperData?.data) return { [HELPERSDATA]: { ...helperData?.data } };
      else return {};
    } catch (error) {
      console.error('Failed to fetch resource:', error);
      return {};
    } finally {
      ISHLPERAPIPENDING = true;
    }
  }
};

export const extractFileNameFromUrl = (
  url: string,
  isEcodedFile: boolean = false
): any => {
  const parts = url.split('/');
  const fileName = parts.pop() || '';
  if (isEcodedFile) {
    const path = parts.join('/');
    const encodedPath = `${path}/${encodeURIComponent(fileName)}`;
    return encodedPath;
  }
  return fileName;
};

export const getAMCColor = (item: any) => {
  // const endDate = new Date(item.end_date);
  // const startDate = new Date(item.start_date);
  // const currentDate = new Date();
  // endDate.setHours(0, 0, 0, 0);
  // startDate.setHours(0, 0, 0, 0);
  // currentDate.setHours(0, 0, 0, 0);
  if (item.amc_status == undefined) {
    //if (startDate > currentDate) {
    //future
    return 'pbOrange';
  } else if (item.amc_status == 3) {
    //if (item.is_active == 2) {
    // archive
    return 'pbArchive';
  } else if (item.amc_status == 2) {
    //if (item.terminated_date || currentDate > endDate) {
    // expired, inactive, terminate
    return 'pbRed';
  } else if (item.amc_status == 1) {
    //active
    return 'pbGreen';
  }
};

export const accountTypeRender = (type?: string) => {
  let image = '/cblu.png';
  switch (type?.toString()) {
    case '2': {
      image = '/fgreen.png';
      break;
    }
    case '3': {
      image = '/porange.png';
      break;
    }
    case 'Premium': {
      image = '/porange.png';
      break;
    }
    case 'Certified': {
      image = '/cblu.png';
      break;
    }
    case 'Freemium': {
      image = '/fgreen.png';
      break;
    }
  }
  return (
    <Image
      className='mr-2 object-contain'
      src={image}
      width={20}
      height={19}
      alt={type || ''}
    />
  );
};

export const getBaseRoute = ({ basePath, ROUTES }: any) => {
  // Determine the base route dynamically based on the basePath
  let baseRoute;
  if (basePath === ROUTES.PBADMIN) {
    baseRoute = ROUTES.PBADMIN;
  } else if (basePath === ROUTES.PBENTERPRISE) {
    baseRoute = ROUTES.PBENTERPRISE;
  } else if (basePath === ROUTES.ENTERPRISE) {
    baseRoute = ROUTES.ENTERPRISE;
  } else {
    // Handle the case when none of the conditions are met, or set a default base route
    baseRoute = ROUTES.PBPARTNER;
  }

  return baseRoute;
};

export const DASHBOARD_ROUTE = '/dashboard';
export const LOGIN_ROUTE = '/login';

export const checkUserAuthorization = (
  isAuthenticated: string | null,
  basePath: string,
  pathName: string,
  router: any
) => {
  // Include all subroutes under DASHBOARD_ROUTE as protected routes
  const protectedRoutes = [
    `/${basePath}${DASHBOARD_ROUTE}/*`,
    `/${basePath}${DASHBOARD_ROUTE}`,
  ];
  // Define login routes
  const loginRoutes = `/${basePath}${LOGIN_ROUTE}`;
  try {
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathName.startsWith(route)
    );

    // Already login then redirect to dashboard
    if (isAuthenticated && pathName === loginRoutes) {
      router.replace(`${basePath}${DASHBOARD_ROUTE}`);
    }

    // if user enter base url then redirect login and dashbord
    else if (
      pathName == `/${ROUTES.PBADMIN}` ||
      pathName == `/${ROUTES.PBPARTNER}` ||
      pathName == `/${ROUTES.PBENTERPRISE}` ||
      pathName == `/${ROUTES.ENTERPRISE}`
    ) {
      if (isAuthenticated) {
        router.replace(`${basePath}${DASHBOARD_ROUTE}`);
      } else {
        router.replace(`${basePath}${LOGIN_ROUTE}`);
      }
    }

    // user enter Procted and not login then redirect to login
    else if (!isAuthenticated && isProtectedRoute) {
      router.replace(`/${basePath}${LOGIN_ROUTE}`);
    } 
  } catch (error) {
    console.error(error);
    // Handle the error appropriately
  }
};
