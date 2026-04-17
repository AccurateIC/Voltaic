import React from "react";
import Pagination from "./Pagination";

export interface DynamicTableColumn<T> {
  key: string;
  header: React.ReactNode;
  headerClassName?: string;
  filter?: React.ReactNode;
  cell: (row: T, rowIndex: number) => React.ReactNode;
}

interface DynamicTableProps<T> {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  columns: DynamicTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  loadingContent?: React.ReactNode;
  emptyContent?: React.ReactNode;
  enableRowSelection?: boolean;
  selectedRowIds?: string[];
  onSelectedRowIdsChange?: (ids: string[]) => void;
  getRowId?: (row: T) => string;
  rowClassName?: (row: T, rowIndex: number) => string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
  };
}

const DynamicTable = <T,>({
  title,
  actions,
  columns,
  data,
  isLoading = false,
  loadingContent,
  emptyContent,
  enableRowSelection = false,
  selectedRowIds = [],
  onSelectedRowIdsChange,
  getRowId = (row: T) => String((row as { id?: string | number }).id ?? ""),
  rowClassName,
  pagination,
}: DynamicTableProps<T>) => {
  const allVisibleSelected = data.length > 0 && data.every((row) => selectedRowIds.includes(getRowId(row)));

  const toggleSelectAllVisibleRows = (checked: boolean) => {
    if (!onSelectedRowIdsChange) return;
    if (!checked) {
      onSelectedRowIdsChange([]);
      return;
    }
    onSelectedRowIdsChange(data.map((row) => getRowId(row)));
  };

  const toggleRow = (rowId: string, checked: boolean) => {
    if (!onSelectedRowIdsChange) return;
    if (checked) {
      onSelectedRowIdsChange([...selectedRowIds, rowId]);
      return;
    }
    onSelectedRowIdsChange(selectedRowIds.filter((id) => id !== rowId));
  };

  return (
    <div className="h-full w-full flex flex-col">
      {(title || actions) && (
        <div className="flex items-center justify-between">
          <div className="text-2xl text-base-content font-semibold flex items-center mb-2">{title}</div>
          <div className="flex gap-2 mb-2">{actions}</div>
        </div>
      )}

      <div className="flex-1 rounded-box shadow-lg bg-base-200 text-base-200 overflow-hidden">
        <div className="overflow-y-auto h-full">
          <table className="table table-pin-rows">
            <thead>
              <tr className="bg-base-100 text-base-content">
                {enableRowSelection && (
                  <th>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={allVisibleSelected}
                      onChange={(event) => toggleSelectAllVisibleRows(Boolean((event as any).target?.checked))}
                    />
                  </th>
                )}

                {columns.map((column) => (
                  <th key={column.key} className={column.headerClassName}>
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {column.filter}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-base-200 text-base-content">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + (enableRowSelection ? 1 : 0)}>{loadingContent}</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (enableRowSelection ? 1 : 0)}>{emptyContent}</td>
                </tr>
              ) : (
                data.map((row, rowIndex) => {
                  const rowId = getRowId(row);
                  return (
                    <tr key={rowId} className={rowClassName?.(row, rowIndex)}>
                      {enableRowSelection && (
                        <td>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={selectedRowIds.includes(rowId)}
                            onChange={(event) => toggleRow(rowId, Boolean((event as any).target?.checked))}
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.key}>{column.cell(row, rowIndex)}</td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          totalRecords={pagination.totalRecords}
          itemsPerPage={pagination.itemsPerPage}
          isLoading={pagination.isLoading}
        />
      )}
    </div>
  );
};

export default DynamicTable;
