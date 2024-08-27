'use client';

import CustomerDetail from '@/components/Customers/CustomerDetail';
import { API_ENDPOINTS_ENTERPRISE } from '@/utils/apiConfig';

const CustomerDetailPage = ({ params }: { params: { id: string } }) => {
  const id = params.id;
  return <CustomerDetail id={id} apiBaseUrl={API_ENDPOINTS_ENTERPRISE} />;
};

export default CustomerDetailPage;
