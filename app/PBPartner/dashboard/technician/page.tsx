'use client';
import TechnicianList from '@/components/Technician/TechnicianList';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';

const Technician = () => {
  return (
    <div className='h-full overflow-hidden p-5'>
      <TechnicianList apiBaseUrl={API_ENDPOINTS_PARTNER} />
    </div>
  );
};

export default Technician;
