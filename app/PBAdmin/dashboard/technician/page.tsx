'use client';
import TechnicianList from '@/components/Technician/TechnicianList';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import React from 'react';

function Technician() {
  return (
    <div className='h-full overflow-hidden p-5'>
      <TechnicianList apiBaseUrl={API_ENDPOINTS} />
    </div>
  );
}

export default Technician;
