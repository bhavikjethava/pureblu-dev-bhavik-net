// TableComponent.js
import React, { useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import SearchInput from './SearchInput';
import Link from 'next/link';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

export interface TableColumn {
  accessorKey: string;
  header: string | React.ReactNode;
  className?: string;
  render?: (item: any, index?: number) => React.ReactNode; // Custom renderer function for the column
  link?: { text: string; onClick: (item: any) => void }; // New link property
}

interface TableProps<T> {
  columns: TableColumn[];
  data: any;
  showSearchInput?: boolean;
  searchTerm?: boolean;
  tbodyClass?: string;
  currentPage?: number;
  totalPage?: number;
  entriesPerPage?: number;
  onNext?: () => void;
  onPrevious?: () => void;
}

function TableComponent<T>({
  columns,
  data,
  showSearchInput,
  searchTerm,
  tbodyClass,
  currentPage = 0,
  totalPage = 0,
  entriesPerPage = 0,
  onNext,
  onPrevious,
}: TableProps<T>) {
  const startEntry = (currentPage - 1) * entriesPerPage + 1;
  const endEntry =
    currentPage * entriesPerPage < totalPage
      ? currentPage * entriesPerPage
      : totalPage;

  return (
    <>
      <div className='relative flex flex-1 flex-col overflow-auto'>
        <table className='relative flex h-full w-full  flex-col border text-sm xl:min-w-full'>
          <thead className=' top-0 block bg-primary'>
            <tr className='table-header flex w-full border-b bg-primary'>
              {columns &&
                columns.map((column) => (
                  <th
                    key={column.accessorKey}
                    className={`${column.className} w-full whitespace-nowrap px-3 py-3 text-left  align-middle font-bold text-white [&:has([role=checkbox])]:pr-0`}
                  >
                    {column.header}
                  </th>
                ))}
            </tr>
          </thead>
          {data ? (
            <>
              {data?.length > 0 ? (
                <ScrollArea  className='h-full'>
                  <tbody className={`${tbodyClass} block`}>
                    {data?.map((item: any, index: number) => (
                      <tr
                        key={item?.id || index}
                        className='flex border-b even:bg-[#f9f9f9]'
                      >
                        {columns.map((column) => (
                          <td
                            key={column.accessorKey}
                            className={`${column.className} flex w-full items-center px-3 py-3 align-middle [&:has([role=checkbox])]:pr-0`}
                          >
                            {column.link ? (
                              <Link
                                href={'#'}
                                className='font-bold text-blueButton-default'
                                onClick={(e) => {
                                  e.preventDefault();
                                  column.link?.onClick(item);
                                }}
                              >
                                {(item as Record<string, any>)[
                                  column.accessorKey
                                ] || 'N/A'}
                              </Link>
                            ) : column.render ? (
                              column.render(item, index)
                            ) : (
                              (item as Record<string, any>)[column.accessorKey]
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </ScrollArea>
              ) : (
                <tbody className='flex grow items-center justify-center'>
                  <tr className='font-bold'>
                    <td>No matching data.</td>
                  </tr>
                </tbody>
              ) }
              {totalPage > 0 ? (
                <nav className='mt-auto flex items-center justify-between gap-4 border-t p-4'>
                  <>
                    <div>
                      <span className='text-sm text-gray-700 dark:text-gray-400'>
                        Showing{' '}
                        <span className='font-semibold text-gray-900 dark:text-white'>
                          {startEntry}
                        </span>{' '}
                        to{' '}
                        <span className='font-semibold text-gray-900 dark:text-white'>
                          {endEntry}
                        </span>{' '}
                        of{' '}
                        <span className='font-semibold text-gray-900 dark:text-white'>
                          {totalPage}
                        </span>{' '}
                        Entries
                      </span>
                    </div>
                    <div className='flex gap-4'>
                      {currentPage != 1 ? (
                        <Button
                          variant={'outline'}
                          size={'sm'}
                          onClick={onPrevious}
                        >
                          Previous
                        </Button>
                      ) : null}
                      {totalPage / entriesPerPage > currentPage &&
                      totalPage > entriesPerPage ? (
                        <Button
                          variant={'outline'}
                          size={'sm'}
                          onClick={onNext}
                        >
                          Next
                        </Button>
                      ) : null}
                    </div>
                  </>
                </nav>
              ) : null}
            </>
          ) : (
            <tbody className='block'>
              <>
                {/* Replace 5 with the number of rows you want to show in the skeleton */}
                {Array.from({ length: 10 }, (_, index) => (
                  <tr key={index} className='table-header flex border-b'>
                    {columns.map((column) => (
                      <td
                        key={column.accessorKey}
                        className={`${column.className} flex min-h-[56px] w-full items-center whitespace-nowrap px-3 py-3 align-middle [&:has([role=checkbox])]:pr-0`}
                      >
                        <Skeleton className='h-4 w-3/4' />{' '}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            </tbody>
          )}
        </table>
      </div>
    </>
  );
}

export default TableComponent;
