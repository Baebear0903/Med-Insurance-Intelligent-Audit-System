import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  current: number;
  total: number;
  pageSize?: number;
  onChange: (page: number) => void;
}

export function Pagination({ current, total, pageSize = 10, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 0) return null;

  const handlePrev = () => current > 1 && onChange(current - 1);
  const handleNext = () => current < totalPages && onChange(current + 1);

  return (
    <div className="flex items-center justify-end gap-2 text-sm">
      <button
        onClick={handlePrev}
        disabled={current === 1}
        className="p-1.5 rounded border text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          // Simplified display logic
          if (
            page === 1 ||
            page === totalPages ||
            (page >= current - 1 && page <= current + 1)
          ) {
            return (
              <button
                key={page}
                onClick={() => onChange(page)}
                className={`w-8 h-8 rounded border flex items-center justify-center transition-colors ${
                  current === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            );
          }
          if (page === current - 2 || page === current + 2) {
            return <span key={page} className="px-1 text-slate-400"><MoreHorizontal className="w-4 h-4"/></span>;
          }
          return null;
        })}
      </span>

      <button
        onClick={handleNext}
        disabled={current === totalPages}
        className="p-1.5 rounded border text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
