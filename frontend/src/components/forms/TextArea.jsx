import React from 'react';

/**
 * Reusable TextArea component.
 */
export default function TextArea({
  label,
  error,
  id,
  rows = 4,
  required = false,
  className = '',
  ...props
}) {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-0.5">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        className={`block w-full rounded-lg border text-sm outline-none transition-all duration-200 px-3 py-2 ${
          error
            ? 'border-rose-300 text-rose-900 placeholder-rose-300 focus:border-rose-500 focus:ring-rose-100'
            : 'border-slate-200 text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100'
        }`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-rose-600 font-semibold" id={`${textareaId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
