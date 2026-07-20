import React from 'react';

/**
 * Reusable SelectInput component.
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {Array<{value: string, label: string}>} props.options
 * @param {string} [props.placeholder]
 * @param {string} [props.id]
 * @param {boolean} [props.required]
 * @param {string} [props.className]
 */
export default function SelectInput({
  label,
  error,
  options = [],
  placeholder,
  id,
  required = false,
  className = '',
  ...props
}) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-0.5">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          required={required}
          className={`block w-full appearance-none rounded-lg border text-sm outline-none transition-all duration-200 px-3 py-2.5 pr-10 bg-slate-50/50 ${
            error
              ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-100'
              : 'border-slate-200 text-slate-800 bg-slate-50/50 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100'
          }`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom Arrow Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-xs text-rose-600 font-semibold" id={`${selectId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
