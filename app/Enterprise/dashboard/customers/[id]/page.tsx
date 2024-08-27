'use client';

import CustomerDetail from '@/components/Customers/CustomerDetail';
import {
  API_ENDPOINTS_CUSTOMERS,
  API_ENDPOINTS_ENTERPRISE,
  API_ENDPOINTS_PARTNER,
} from '@/utils/apiConfig';
import ROUTES, { getBaseUrl } from '@/utils/utils';
import { usePathname } from 'next/navigation';

const CustomerDetailPage = ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBEnterprise = basePath == ROUTES.PBENTERPRISE;

  return <CustomerDetail id={id} apiBaseUrl={API_ENDPOINTS_CUSTOMERS} />;
};

export default CustomerDetailPage;
