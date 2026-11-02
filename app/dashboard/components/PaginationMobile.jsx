"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationMobile({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showingCount,
  totalCount,
  entityName = "elementos",
}) {
  const page = Number(currentPage) || 1;

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-full overflow-hidden">
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Mostrando <span className="font-medium">{showingCount}</span> de{" "}
        <span className="font-medium">{totalCount}</span> {entityName}
      </p>

      {totalPages > 1 && (
        <>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              aria-label="Página anterior"
              className={`flex items-center justify-center h-9 w-9 shrink-0 rounded-lg border transition-colors ${
                page === 1
                  ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed dark:bg-blue-400 dark:text-gray-300 dark:border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-blue-600 dark:text-gray-300 dark:border-blue-600"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="min-w-[2rem] text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
              {page}
            </span>

            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              aria-label="Página siguiente"
              className={`flex items-center justify-center h-9 w-9 shrink-0 rounded-lg border transition-colors ${
                page === totalPages
                  ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed dark:bg-blue-400 dark:text-gray-300 dark:border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100  dark:bg-blue-600 dark:text-gray-300 dark:border-blue-600"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Página <b>{page}</b> de <b>{totalPages}</b>
          </p>
        </>
      )}
    </div>
  );
}
