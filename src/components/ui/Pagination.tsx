import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  current: number;
  total: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  showTotal?: boolean | ((total: number, range: [number, number]) => React.ReactNode);
  onPageSizeChange?: (pageSize: number) => void;
  onChange: (page: number) => void;
}

export function Pagination({
  current,
  total,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  showSizeChanger = false,
  showTotal = false,
  onPageSizeChange,
  onChange
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = Math.min(total, current * pageSize);

  const handlePrev = () => current > 1 && onChange(current - 1);
  const handleNext = () => current < totalPages && onChange(current + 1);

  return (
    <div className="flex items-center justify-end gap-3 text-sm text-slate-600 select-none">
      {showTotal && (
        <div className="text-slate-500 text-xs sm:text-sm mr-1">
          {typeof showTotal === "function"
            ? showTotal(total, [start, end])
            : `共 ${total} 条`}
        </div>
      )}

      {showSizeChanger && (
        <div className="flex items-center space-x-1.5 text-xs text-slate-600">
          <span>每页</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              onPageSizeChange?.(newSize);
            }}
            className="border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span>条</span>
        </div>
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={handlePrev}
          disabled={current <= 1}
          className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            if (
              page === 1 ||
              page === totalPages ||
              (page >= current - 1 && page <= current + 1)
            ) {
              return (
                <button
                  key={page}
                  onClick={() => onChange(page)}
                  className={`w-8 h-8 rounded border flex items-center justify-center text-xs font-medium transition-colors ${
                    current === page
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              );
            }
            if (page === current - 2 || page === current + 2) {
              return (
                <span key={page} className="px-1 text-slate-400">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </span>
              );
            }
            return null;
          })}
        </span>

        <button
          onClick={handleNext}
          disabled={current >= totalPages}
          className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
