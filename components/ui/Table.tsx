'use client';

import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// TABLE TYPES
// ============================================

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyState?: ReactNode;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (row: T) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  stickyHeader?: boolean;
  className?: string;
}

// ============================================
// TABLE COMPONENT
// ============================================

export default function Table<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyState,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  stickyHeader = false,
  className,
}: TableProps<T>) {
  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(keyExtractor));
    }
  };

  const handleSelectRow = (id: string) => {
    if (!onSelectionChange) return;
    
    if (selectedRows.includes(id)) {
      onSelectionChange(selectedRows.filter((rowId) => rowId !== id));
    } else {
      onSelectionChange([...selectedRows, id]);
    }
  };

  const handleSort = (column: Column<T>) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  if (loading) {
    return (
      <div className={cn('rounded-2xl overflow-hidden border border-slate-200 bg-white/70 backdrop-blur-sm', className)}>
        <div className="animate-pulse">
          {/* Header */}
          <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200">
            {columns.map((_, i) => (
              <div key={i} className="h-4 bg-slate-200 rounded flex-1" />
            ))}
          </div>
          {/* Rows */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 last:border-b-0">
              {columns.map((_, j) => (
                <div key={j} className="h-4 bg-slate-100 rounded flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('rounded-2xl overflow-hidden border border-slate-200 bg-white/70 backdrop-blur-sm', className)}>
        {emptyState || (
          <div className="py-12 text-center text-slate-500">
            Keine Daten vorhanden
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl overflow-hidden border border-slate-200 bg-white/70 backdrop-blur-sm', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={cn('bg-slate-50 border-b border-slate-200', stickyHeader && 'sticky top-0 z-10')}>
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer hover:text-slate-700 transition-colors select-none'
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className={cn('flex items-center gap-1', column.align === 'right' && 'justify-end')}>
                    <span>{column.header}</span>
                    {column.sortable && sortColumn === column.key && (
                      <svg
                        className={cn('w-4 h-4 transition-transform', sortDirection === 'desc' && 'rotate-180')}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIndex) => {
              const rowId = keyExtractor(row);
              const isSelected = selectedRows.includes(rowId);

              return (
                <tr
                  key={rowId}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'transition-colors',
                    isSelected ? 'bg-blue-50' : 'hover:bg-slate-50/50',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {selectable && (
                    <td className="w-12 px-4 py-4">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowId)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = getNestedValue(row, column.key);
                    
                    return (
                      <td
                        key={column.key}
                        className={cn(
                          'px-4 py-4',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {column.render ? column.render(value, row, rowIndex) : value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// CHECKBOX HELPER
// ============================================

interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  onClick?: (e: React.MouseEvent) => void;
}

function Checkbox({ checked, indeterminate, onChange, onClick }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        onClick?.(e);
        onChange();
      }}
      className={cn(
        'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
        checked || indeterminate
          ? 'bg-blue-500 border-blue-500 text-slate-900'
          : 'border-slate-300 hover:border-slate-400'
      )}
    >
      {checked && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {indeterminate && !checked && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}

// ============================================
// PAGINATION
// ============================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className,
}: PaginationProps) {
  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== 'ellipsis') {
        pages.push('ellipsis');
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {totalItems !== undefined && itemsPerPage !== undefined && (
        <p className="text-sm text-slate-500">
          Zeige {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} von {totalItems}
        </p>
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'p-2 rounded-lg transition-colors',
            currentPage === 1
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {getVisiblePages().map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium transition-colors',
                currentPage === page
                  ? 'bg-blue-500 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'p-2 rounded-lg transition-colors',
            currentPage === totalPages
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
