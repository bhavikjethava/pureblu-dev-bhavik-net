'use client';

import ComplainsDetails from '@/components/ComplainsDetails';
import {
  API_ENDPOINTS,
  API_ENDPOINTS_ENTERPRISE,
  API_ENDPOINTS_PARTNER,
} from '@/utils/apiConfig';
import ROUTES, { getBaseUrl } from '@/utils/utils';
import { usePathname } from 'next/navigation';

const CustomerDetailPage = ({
  params,
}: {
  params: { customerId: string; reportId: string };
}) => {
  const { customerId, reportId } = params;
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBEnterprise = basePath == ROUTES.PBENTERPRISE;

  return (
    <ComplainsDetails
      customerId={customerId}
      reportId={reportId}
      apiBaseUrl={API_ENDPOINTS}
    />
  );
};

export default CustomerDetailPage;
