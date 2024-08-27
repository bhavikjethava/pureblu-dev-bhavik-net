'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import SearchInput from './SearchInput';
import AddTechnician from '@/components/Technician/AddTechnician';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  headerBackgroundColor?: string;
  showSearchInput?: boolean;
  rowSelection?: { [key: string]: boolean }; // Make rowSelection optional
  columnClassNames?: string[]; // New prop to hold custom class names for each column
}

export function DataTable<TData, TValue>({
  columns,
  data,
  headerBackgroundColor = '', // default background color
  showSearchInput = true, // default is to show search input
  rowSelection, // Use the optional rowSelection prop
}: DataTableProps<TData, TValue>) {
  const [internalRowSelection, setInternalRowSelection] = React.useState(
    rowSelection || {}
  );
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setInternalRowSelection,
    state: {
      rowSelection: internalRowSelection,
    },
    initialState: {
      pagination: {
        pageSize: data.length,
      },
    },
  });

  const numColumns = columns.length;
  const [searchValue, setSearchValue] = React.useState('');
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    table.getColumn('Name')?.setFilterValue(value);
  };
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <div className='relative flex flex-1 flex-col overflow-auto'>
      {showSearchInput && (
        <SearchInput
          value={searchValue}
          onChange={handleSearchChange}
          className={'py-4'}
        />
      )}
      {table && (
        <Table className={`relative flex h-full flex-col border`}>
          <TableHeader
            className={`sticky top-0 z-10 block bg-primary ${headerBackgroundColor}`}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={`flex`}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableCell
                      key={header.id}
                      className={`w-full font-bold text-white   ${
                        (header.column.columnDef as any).className || ''
                      }`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <ScrollArea className={``}>
            <TableBody className='block '>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={`flex even:bg-[#f9f9f9]`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`w-full whitespace-nowrap ${
                          (cell.column.columnDef as any).className || ''
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={numColumns} className='h-24 text-center'>
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </ScrollArea>
        </Table>
      )}

      {/* <AddTechnician open={isDialogOpen} onClose={handleCloseDialog} /> */}
    </div>
  );
}
