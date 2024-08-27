'use client';
import React, { useContext, useEffect, useState } from 'react';
import UserList from '@/components/Users/UserList';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';

function AddAdmins() {
  return (
    <>
      <UserList apiBaseUrl={API_ENDPOINTS_PARTNER} />
    </>
  );
}

export default AddAdmins;
