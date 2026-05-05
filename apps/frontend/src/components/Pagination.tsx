import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords: number;
  itemsPerPage: number;
  isLoading?: boolean;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalRecords,
  itemsPerPage,
  isLoading = false,
}: PaginationProps) => {
  const indexOfFirst = (currentPage - 1) * itemsPerPage;
  const indexOfLast = Math.min(currentPage * itemsPerPage, totalRecords);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)
  );

  const withEllipsis: (number | "...")[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) withEllipsis.push("...");
    withEllipsis.push(p);
  });

  return (
    <div className="flex flex-col gap-1 px-3 py-2 bg-base-200 border-t border-base-content/20">

      {/* Mobile layout */}
      <div className="flex items-center gap-1 w-full md:hidden">
        <button
          className="btn btn-sm btn-outline flex-1"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          ← Prev
        </button>
        <span className="flex-1 text-center text-sm text-base-content/60">
          {currentPage} / {totalPages}
        </span>
        <button
          className="btn btn-sm btn-outline flex-1"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          Next →
        </button>
      </div>
      <span className="text-xs text-base-content/60 text-center md:hidden">
        Showing {totalRecords === 0 ? 0 : indexOfFirst + 1}–{indexOfLast} of {totalRecords}
      </span>

      {/* Desktop/tablet layout — text left, buttons right */}
      <div className="hidden md:flex items-center justify-between gap-2">
        <span className="text-sm text-base-content/60">
          Showing {totalRecords === 0 ? 0 : indexOfFirst + 1}–{indexOfLast} of {totalRecords}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            ← Prev
          </button>
          {withEllipsis.map((p, i) =>
            p === "..." ? (
              <span key={"e" + i} className="px-1 text-base-content/40 select-none">…</span>
            ) : (
              <button
                key={p}
                className={"btn btn-sm " + (currentPage === p ? "btn-primary" : "btn-outline")}
                onClick={() => onPageChange(p as number)}
                disabled={isLoading}
              >
                {p}
              </button>
            )
          )}
          <button
            className="btn btn-sm btn-outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            Next →
          </button>
        </div>
      </div>

    </div>
  );
};

export default Pagination;