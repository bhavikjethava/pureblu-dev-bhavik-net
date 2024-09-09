// apiConfig.js

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const SUBPATH = `/api/`;
export const ADMIN = `${SUBPATH}admin/`;
export const PARTNER_ = `${SUBPATH}partner/`;
const PARTNER = '/partner/';
const ENTERPRISE = '/enterprise/';
// export const DASHBOARDREQUEST = `${'/partner/request-dashboard'}`;

// Admin Apis
export const API_ENDPOINTS = {
  VERIFY_PHONE: `${SUBPATH}verify/phone`,
  LOGIN: `${SUBPATH}login`,
  TECHNICIAN: `${ADMIN}technician`,
  PARTNERS: '/partners',
  ENTERPRISE: `${ADMIN}enterprise`,
  PARTNER_COMPLAINS: '/partner-complains',
  ADMINS_USER: `${ADMIN}user`,
  PARTNER_USER: `${ADMIN}partner`,
  HELPER_API: `${SUBPATH}helper`,
  SKILL: `${ADMIN}manage/skill`,
  BRAND: `${ADMIN}manage/brand`,
  MACHINETYPE: `${ADMIN}manage/machine-type`,
  MACHINEVARIANT: `${ADMIN}manage/machine-variant`,
  UNITTONNAGE: `${ADMIN}manage/unit-tonnage`,
  ACTIONCHECKLIST: `${ADMIN}manage/action-check-list`,
  SPAREPARTS: `${ADMIN}manage/spare-parts`,
  REQUESTTYPE: `${ADMIN}manage/request-type`,
  REQUESTSTATUS: `${ADMIN}manage/request-status`,
  SERVICEACTION: `${ADMIN}manage/service-action`,
  MACHINEMODEL: `${ADMIN}manage/machine-model`,
  MANAGEAMC: `${ADMIN}manage/amc`,
  ADMIN_LOGIN_AS_PARTNER: `${SUBPATH}admin-login-as-partner`,
  ADMIN_LOGIN_AS_ENTERPRISE: `${SUBPATH}admin-login-as-enterprise`,
  HELPER_TYPES: `${SUBPATH}helper?types=admin_user_role,gender,country,partner_user_role,partner_type,spare_type,uom,capacity_unit,rating,technician_pause_reason,equipment,cooling_coil_type,refrigerant,condensor_cooling_coil_type,amc_service_type,state `,
  HELPER_TYPE_SPARE: 'spare_type',
  HELPER_TYPE_UOM: 'uom',
  HELPER_TYPE_CAPACITY_UNIT: 'capacity_unit',
  RATING: 'rating',
  PARTNER: `${ADMIN}partner`,
  GET_USER_TYPE: `${ADMIN}get-user-type`,
  GEADE: `${ADMIN}manage/grade`,
  CUSTOMERS: `${ADMIN}customer`,
  AMC_PLANS: `${ADMIN}manage/amc`,
  PREVENTIVE_SERVICES: `${ADMIN}preventive-services`,
  CLEAR_PAST_HISTORY: `${ADMIN}preventive-services/clear-past-history`,
  MARK_AS_COMPLETE: `${ADMIN}preventive-services/mark-as-complete`,
  DASHBOARDREQUEST: `${ADMIN}request-dashboard`,
  ASSIGN_TECHNICIAN: `${ADMIN}request-assign-technician-multiple`,
  REQUEST_SERVICE_REPORT: `${ADMIN}request-service-report`,
  EXPORT_TECHNICIAN_REPORT: `${ADMIN}export-technician-report`,
  EXPORT_ADMIN_REPORT: `${ADMIN}export-admin-report`,
  TECHNICIAN_REPORT_LIST: `${ADMIN}technician-report-list`,
  ADMIN_REPORT_LIST: `${ADMIN}admin-report-list`,
  AMC_REMINDER: `${ADMIN}amc/reminder-list`,
  SEND_REMINDER: `${ADMIN}amc/send-reminder`,
  EXPORT_AMC_REMINDER_LIST: `${ADMIN}amc/export-amc-reminder-list`,
  AMC_CUSTOMER: `${ADMIN}amc/customer/`,
  GLOBAL_SETTING: `${ADMIN}manage-settings/global`,
  COUTRY: `${ADMIN}geography/country`,
  STATE: `${ADMIN}geography/state`,
  CITY: `${ADMIN}geography/city`,
  CONSOLIDATE_PARTNER_REPORT: `${ADMIN}consolidate-partner-report`,
  SPARE_PARTS_REPORT: `${ADMIN}spare-parts-list`,
  TECHNICIAN_BY_PARTNER: `${ADMIN}technician-by-partner`,
  CALENDAR_REQUEST: `${ADMIN}calendar-request`,
  EXPORT_SPARE_PARTS: `${ADMIN}export-spare-parts`,
  CUSTOMER_REPORT_LIST: `${ADMIN}customer-report-list`,
  CHECKEDIN_TECHNICIAN_LIST: `${ADMIN}request/checkedin-techniciton-list`,
  PAST_REQUEST: `${ADMIN}past-request`,
  WEB_SERVICE_REPORT: `${SUBPATH}web-service-report`,
  CONFIRM_ACCOUNT: `${SUBPATH}customer/confirm-account`,
  TECHNICIAN_FEEDBACK: `${SUBPATH}`,
  PARTNER_CUSTOMER_REPORT_DOWNLOAD: `${SUBPATH}partner/customer-report/download`,
  IMPORT_CUSTOMERS: `${ADMIN}customer/import`,
  IMPORT_TECHNICIANS: `${ADMIN}technician/import`,
  IMPORT_DEVICES: `${ADMIN}customer/{id}/device/import`,
  IMPORT_MACHINE_MODEL: `${ADMIN}machine-model/import`,
  TECHNICIAN_REGISTER: `${ADMIN}technician-register`,
};

// Partner Apis
export const API_ENDPOINTS_PARTNER = {
  ...API_ENDPOINTS,
  PARTNERS_DETAIL: `${PARTNER_}`,
  UPDATE_PARTNER: `${PARTNER_}update-profile`,
  REQUEST_BACKUP: `${PARTNER_}request-data-backup`,
  MANAGE_SERVICE_REPORT: `${PARTNER_}manage-service-report`,
  CUSTOMER_REPORT: `${PARTNER_}download-customer-report`,
};

// Enerprise Apis
export const API_ENDPOINTS_ENTERPRISE = {
  ...API_ENDPOINTS,
};

for (const key in API_ENDPOINTS_PARTNER) {
  if (Object.hasOwnProperty.call(API_ENDPOINTS_PARTNER, key)) {
    API_ENDPOINTS_PARTNER[key] = API_ENDPOINTS_PARTNER[key].replace(
      /\/admin\//g,
      `${PARTNER}`
    );
  }
}

export const API_ENDPOINTS_CUSTOMERS = {
  ...API_ENDPOINTS,
};

for (const key in API_ENDPOINTS_CUSTOMERS) {
  if (Object.hasOwnProperty.call(API_ENDPOINTS_CUSTOMERS, key)) {
    API_ENDPOINTS_CUSTOMERS[key] = API_ENDPOINTS_CUSTOMERS[key].replace(
      /\/admin\//g,
      `${ENTERPRISE}`
    );
  }
}
