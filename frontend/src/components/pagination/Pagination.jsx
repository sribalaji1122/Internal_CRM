import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable Pagination controls.
 * @param {object} props
 * @param {number} props.currentPage
 * @param {number} props.totalPages
 * @param {function} props.onPageChange
 * @param {number} props.totalRecords
 * @param {number} props.recordsPerPage
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalRecords = 0,
  recordsPerPage = 10
}) {
  const startRecord = (currentPage - 1) * recordsPerPage + 1;
  const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 bg-white px-6 py-4 rounded-xl shadow-sm border mt-4">
      {/* Label status */}
      <div className="text-xs text-slate-500 font-semibold">
        Showing <span className="text-slate-800">{startRecord}</span> to{' '}
        <span className="text-slate-800">{endRecord}</span> of{' '}
        <span className="text-slate-800">{totalRecords}</span> records
      </div>

      {/* Pages navigator */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((pg) => (
          <button
            key={pg}
            onClick={() => onPageChange(pg)}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold border transition-all ${
              pg === currentPage
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            {pg}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          title="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
