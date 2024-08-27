'use client';
import Breadcrumb from '@/components/Breadcrumb';
import { API_ENDPOINTS, API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import React, { useContext, useEffect, useState } from 'react';
import { apiCall } from '@/hooks/api';
import { useMutation } from 'react-query';
import SearchInput from '@/components/SearchInput';
import { Button } from '@/components/ui/button';
import { IconBxErrorCircle, IconLoading, IconSearch } from '@/utils/Icons';
import TableComponent from '@/components/Table';
import moment from 'moment';
import { showToast } from '@/components/Toast';
import ServiceReportDialog from '@/components/Service Report/ServiceReportDialog';

interface Column {
  accessorKey: string;
  header: any;
  className?: string;
  [key: string]: any;
}

const PERPAGE = 50;

const SearchServiceReport = ({ apiBaseUrl, customerId }: any) => {
  const apiAction = useMutation(apiCall);
  const [reportListList, setReportList] = useState<FormData[] | undefined>([]);
  const [selectedReport, setSelectedReport] = useState<any>({});
  const [fetchLoading, setFetchLoading] = useState(false);
  const [searchComplaintsTerm, setSearchComplaintsTerm] = useState<string>('');
  const [openServiceReportDialog, setOpenServiceReportDialog] = useState(false);
  const [complaintDetail, setComplaintDetail] = useState();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const onSearchClcik = () => {
    if (!searchComplaintsTerm.trim()) {
      showToast({
        variant: 'destructive',
        message: 'Please enter minimum 3 character to search',
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
    } else {
      setPage(1);
      fetchReportList();
    }
  };

  const fetchReportList = async (newPage: number = page) => {
    setReportList(undefined);
    try {
      setFetchLoading(true);
      const report_list = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${customerId}/service-report-list?search=${searchComplaintsTerm}&page=${newPage}&per_page=${PERPAGE}`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(report_list);
      setReportList(data.data);
      setTotal(data?.total);
      total;
      setFetchLoading(false);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
      setFetchLoading(false);
    }
  };

  const fetchReportDetail = async (report: any) => {
    try {
      setFetchLoading(true);
      const data = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${customerId}/request/${report?.request_id}/service-report/${report?.id}`,
        method: 'GET',
      };

      const response = await apiAction.mutateAsync(data);
      setSelectedReport(response?.data);
      setOpenServiceReportDialog(true);

      setFetchLoading(false);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
      setFetchLoading(false);
    }
  };

  const onSearch = (text: string) => {
    setSearchComplaintsTerm(text);
  };

  const getReportDetail = async (report: any) => {
    setComplaintDetail(report.customer_request);
    fetchReportDetail(report);
  };

  const onNext = () => {
    const newPage = page + 1;
    setPage(newPage);
    fetchReportList(newPage);
  };

  const onPrevious = () => {
    const newPage = page - 1;
    setPage(newPage);
    fetchReportList(newPage);
  };

  const columns: Column[] = [
    { accessorKey: 'id', header: 'Service Report ID' },
    { accessorKey: 'request_id', header: 'Complain ID' },
    {
      accessorKey: 'device_name',
      header: 'Device',
      render: (item: any) => (
        <span className='block  '>{item?.customer_request?.device?.name}</span>
      ),
    },
    { accessorKey: 'model', header: 'Model' },
    {
      accessorKey: 'report_date	',
      header: 'Report Date',
      render: (item: any) => (
        <span className='block  '>
          {moment(item?.customer_request?.created_at).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      className: 'max-w-[150px]',
      render: (item: any) => (
        <div className='flex flex-col gap-2'>
          <Button
            variant='outline'
            size={'sm'}
            onClick={() => getReportDetail(item)}
          >
            View Report
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className='flex h-[calc(100%-65px)] flex-grow flex-col p-5 '>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        <Breadcrumb />
        <div className='grid w-full grid-cols-1 items-center gap-5 rounded-md lg:grid-cols-9'>
          <div className='lg:col-span-7'>
            <SearchInput
              value={searchComplaintsTerm}
              onChange={onSearch}
              onSubmit={onSearchClcik}
              placeholder='Device Name (Min 3 character) or Model Number (full) or Service Report ID'
            />
          </div>
          <div className='gap-5 lg:col-span-2'>
            <Button
              variant={'blue'}
              className='!w-full'
              onClick={onSearchClcik}
              disabled={fetchLoading}
              icon={
                fetchLoading ? (
                  <IconLoading />
                ) : (
                  <IconSearch className='h-4 w-4 text-white' />
                )
              }
            >
              Search
            </Button>
          </div>
        </div>

        <TableComponent
          columns={columns}
          data={reportListList}
          searchTerm={false}
          entriesPerPage={PERPAGE}
          currentPage={page}
          totalPage={total}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      </div>

      {openServiceReportDialog && (
        <ServiceReportDialog
          open={openServiceReportDialog}
          onClose={() => {
            setOpenServiceReportDialog(false), setSelectedReport({});
          }}
          apiBaseUrl={apiBaseUrl}
          complaintDetail={complaintDetail}
          reportListList={
            selectedReport?.id ? [selectedReport] : reportListList
          }
        />
      )}
    </div>
  );
};

export default SearchServiceReport;
