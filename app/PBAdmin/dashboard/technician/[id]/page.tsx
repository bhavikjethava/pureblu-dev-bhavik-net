'use client';

import TechnicianDetail from '@/components/Technician/TechnicianDetail';
import { API_ENDPOINTS } from '@/utils/apiConfig';

const TechnicianDetailPage = ({ params }: { params: { id: string } }) => {
  const id = params.id;

  return <TechnicianDetail id={id} apiBaseUrl={API_ENDPOINTS} />;
};

export default TechnicianDetailPage;
