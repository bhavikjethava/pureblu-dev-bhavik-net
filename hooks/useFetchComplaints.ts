// src/hooks/useFetchComplaints.ts

import { useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import moment from 'moment';
import { DataContext } from '@/context/dataProvider';
import { REFRESHCOMPLAINTLIST } from '@/utils/utils';
import useDebounce from './useDebounce';

interface FetchComplaintsOptions {
  isTechnician?: boolean;
  id?: any;
  isPastComplaints?: boolean;
  isManageServiceReport?: boolean;
  isSparePartsReport?: boolean;
  searchData?: any;
  partner_id?: any;
}

const useFetchComplaints = (
  apiBaseUrl: any,
  options: FetchComplaintsOptions = {},
  callOnButtonClick: boolean = false // Default value is false, meaning call on page load
) => {
  const {
    isTechnician,
    id,
    isPastComplaints,
    isManageServiceReport,
    isSparePartsReport,
    searchData,
    partner_id,
  } = options;

  const [complaintList, setComplaintList] = useState<Array<any>>([]);
  const apiAction = useMutation(apiCall);
  const { state, setData } = useContext(DataContext);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [perPage] = useState(50);

  // Debounce searchData to prevent too many fetches
  const debouncedSearchData = useDebounce(searchData, 500); // Adjust delay as needed

  const fetchComplaints = async () => {
    setComplaintLoading(true);
    try {
      const { search } = searchData;

      // Build URL parameters based on the presence of values
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const branchParam =
        searchData.selectedBranch?.id !== -1 ? `&branch_id=${searchData.selectedBranch?.id}` : '';
      const deviceParam =
        searchData.selectedDevice?.id !== -1 ? `&device_id=${searchData.selectedDevice?.id}` : '';

      let endpoint = `${apiBaseUrl.CUSTOMERS}/${id}/request?page=${currentPage}&per_page=${perPage}${searchParam}${branchParam}${deviceParam}`;

      if (isPastComplaints) {
        const fromDate = searchData.from
          ? moment(searchData.from).format('Y-MM-DD')
          : '';
        const toDate = searchData.to
          ? moment(searchData.to).format('Y-MM-DD')
          : '';
        const searchParam = searchData.search
          ? `&search=${searchData.search}`
          : '';
        endpoint = `${apiBaseUrl.PAST_REQUEST}?page=${currentPage}&per_page=${perPage}${searchParam}`;

        if (fromDate) {
          endpoint += `&from=${fromDate}`;
        }

        if (toDate) {
          endpoint += `&to=${toDate}`;
        }
      } else if (isTechnician) {
        const searchParam = searchData.search
          ? `&search=${searchData.search}`
          : '';
        endpoint = `${apiBaseUrl.TECHNICIAN}/${id}/customer-request?page=${currentPage}${searchParam}&per_page=${perPage}`;
      } else if (isManageServiceReport) {
        const fromDate = searchData.from
          ? moment(searchData.from).format('Y-MM-DD')
          : '';
        const toDate = searchData.to
          ? moment(searchData.to).format('Y-MM-DD')
          : '';
        const searchParam = searchData.search
          ? `&search=${searchData.search}`
          : '';
        endpoint = `${apiBaseUrl.REQUEST_SERVICE_REPORT}?page=${currentPage}&per_page=${perPage}&from=${fromDate}&to=${toDate}${searchParam}`;
      } else if (isSparePartsReport) {
        const fromDate = searchData.from
          ? moment(searchData.from).format('Y-MM-DD')
          : '';
        const toDate = searchData.to
          ? moment(searchData.to).format('Y-MM-DD')
          : '';

        const searchParam = searchData.search
          ? `&search=${searchData.search}`
          : '';

        let dateParams = '';
        if (fromDate) {
          dateParams += `&from=${fromDate}`;
        }
        if (toDate) {
          dateParams += `&to=${toDate}`;
        }

        endpoint = `${apiBaseUrl.SPARE_PARTS_REPORT}?need_all=0${dateParams}${searchParam}`;
        if (partner_id) {
          endpoint += `&partner_id=${partner_id}`;
        }
      }

      const fetchComplaintsData = {
        endpoint,
        method: isSparePartsReport ? 'POST' : 'GET',
      };
      const { data } = await apiAction.mutateAsync(fetchComplaintsData);
      if (isTechnician) {
        setComplaintList([data]);
        setTotalPages(data?.request?.total || 0);
      } else {
        setComplaintList(data.data);
        setTotalPages(data?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setComplaintLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [
    callOnButtonClick,
    isPastComplaints,
    currentPage,
    isManageServiceReport,
    state?.[REFRESHCOMPLAINTLIST],
    debouncedSearchData,
  ]);

  const updateComplaintList = (updatedComplaints: Array<any>) => {
    setComplaintList(updatedComplaints);
  };

  return {
    complaintList,
    fetchComplaints,
    updateComplaintList,
    complaintLoading,
    currentPage,
    totalPages,
    perPage,
    setCurrentPage,
  };
};

export default useFetchComplaints;
