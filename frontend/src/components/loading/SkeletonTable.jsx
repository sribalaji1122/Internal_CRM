import React from 'react';

/**
 * Reusable SkeletonTable loader for lists and queues.
 * @param {object} props
 * @param {number} [props.columnsCount] - Number of columns to show.
 * @param {number} [props.rowsCount] - Number of rows to show.
 */
export default function SkeletonTable({ columnsCount = 5, rowsCount = 5 }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm animate-pulse">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {Array.from({ length: columnsCount }).map((_, idx) => (
                <th key={idx} className="px-6 py-4">
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {Array.from({ length: rowsCount }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {Array.from({ length: columnsCount }).map((_, colIdx) => (
                  <td key={colIdx} className="px-6 py-4">
                    <div className="h-3.5 bg-slate-200/80 rounded" style={{ width: `${Math.max(40, Math.min(100, (colIdx * 15) + 50))}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
