import React from 'react';

/**
 * Reusable StatusBadge component to highlight CRM record states.
 * @param {object} props
 * @param {string} props.status - The status label (e.g. 'New', 'Contacted', 'Qualified', 'Lost', 'Active', 'Draft').
 * @param {string} [props.className] - Additional classes.
 */
export default function StatusBadge({ status = '', className = '' }) {
  const normStatus = status.trim().toLowerCase();

  const configMap = {
    new: { bg: 'bg-blue-50 text-blue-700 border-blue-200/60', dot: 'bg-blue-500' },
    contacted: { bg: 'bg-amber-50 text-amber-700 border-amber-200/60', dot: 'bg-amber-500' },
    qualified: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dot: 'bg-emerald-500' },
    lost: { bg: 'bg-rose-50 text-rose-700 border-rose-200/60', dot: 'bg-rose-500' },
    scheduled: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60', dot: 'bg-indigo-500' },
    completed: { bg: 'bg-teal-50 text-teal-700 border-teal-200/60', dot: 'bg-teal-500' },
    cancelled: { bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
    active: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dot: 'bg-emerald-500' },
    paused: { bg: 'bg-orange-50 text-orange-700 border-orange-200/60', dot: 'bg-orange-500' },
    draft: { bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' }
  };

  const current = configMap[normStatus] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-400'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-relaxed shadow-sm transition-all duration-200 ${current.bg} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      {status}
    </span>
  );
}
