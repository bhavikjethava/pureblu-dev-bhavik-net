'use client';
import Login from '@/components/Login';
import React, { useState } from 'react';

const PBAdminLogin = () => {
  return (
    <div className='flex grow items-center justify-center bg-muted p-4'>
      <Login title='Admin Dashboard' buttonText='Get OTP' />
    </div>
  );
};

export default PBAdminLogin;
