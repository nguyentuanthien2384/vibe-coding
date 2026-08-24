"use client";

import React from "react";
import { PointsHistoryPaginationProps } from "../../../types/points.types";

export const PointsHistoryPagination: React.FC<PointsHistoryPaginationProps> = ({
  meta,
  onPageChange,
  isLoading = false,
}) => {
  const { page, totalPages } = meta;

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
      <div className="text-xs text-slate-500 font-medium">
        Trang <strong className="text-slate-800">{page}</strong> / {totalPages} (
        {meta.total} giao dịch)
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isLoading}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-slate-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Trước
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .map((p, idx, arr) => {
            const prev = arr[idx - 1];
            const isEllipsis = prev && p - prev > 1;

            return (
              <React.Fragment key={p}>
                {isEllipsis && (
                  <span className="px-1 text-xs text-slate-400">...</span>
                )}
                <button
                  type="button"
                  onClick={() => onPageChange(p)}
                  disabled={isLoading}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                    page === p
                      ? "bg-orange-600 text-white shadow-xs"
                      : "border border-gray-200 text-slate-700 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            );
          })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-slate-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Sau
        </button>
      </div>
    </div>
  );
};
