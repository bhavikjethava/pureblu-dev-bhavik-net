'use client';
import React, { useContext, useEffect, useState } from 'react';
import UserList from '@/components/Users/UserList';
import { API_ENDPOINTS } from '@/utils/apiConfig';

function AddAdmins() {
  return (
    <>
      <UserList apiBaseUrl={API_ENDPOINTS} />
    </>
  );
}

export default AddAdmins;
