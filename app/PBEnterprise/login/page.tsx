'use client';
import Login from '@/components/Login';
import React, { useState } from 'react';

const PBAdminLogin = () => {
  return (
    <div className='flex grow items-center justify-center bg-muted'>
      <Login title='Dashboard' buttonText='Get OTP' />
    </div>
  );
};

export default PBAdminLogin;
