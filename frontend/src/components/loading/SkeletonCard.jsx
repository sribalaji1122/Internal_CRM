import React from 'react';

/**
 * Reusable SkeletonCard for loading states in dashboards or grids.
 * @param {object} props
 * @param {string} [props.className]
 */
export default function SkeletonCard({ className = '' }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse ${className}`}>
      {/* Header mock */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="h-4 w-28 bg-slate-200 rounded" />
        <div className="h-8 w-8 bg-slate-200 rounded-lg" />
      </div>
      
      {/* Content mock lines */}
      <div className="space-y-3">
        <div className="h-3 w-1/3 bg-slate-200/80 rounded" />
        <div className="h-6 w-1/2 bg-slate-200/80 rounded" />
        <div className="h-3 w-3/4 bg-slate-200/60 rounded" />
      </div>
    </div>
  );
}
