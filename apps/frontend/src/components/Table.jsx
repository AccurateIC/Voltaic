import React, { useState } from "react";
import Skeleton from "./Skeleton";
import Pagination from "./Pagination";

const Table = ({ columns, data, rowsPerPage = 5, isLoading = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  if (isLoading) {
    return <Skeleton type="table" rows={rowsPerPage} columns={columns.length} />;
  }

  const totalPages = Math.ceil(data.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = data.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <table border="1" width="100%" cellPadding="10" style={{ borderCollapse: "collapse", borderColor: "#e5e7eb" }}>
        <thead style={{ background: "#f9fafb" }}>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{ textAlign: "left", flex: 1, padding: "12px 16px", borderBottom: "2px solid #e5e7eb" }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((row, rowIndex) => (
              <tr key={rowIndex} style={{ borderBottom: "1px solid #f3f4f6" }}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} style={{ padding: "12px 16px" }}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {data.length > 0 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Table;
