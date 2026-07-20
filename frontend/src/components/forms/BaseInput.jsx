import React from 'react';

/**
 * Foundational input component that manages styles, icons, errors, and labels.
 */
export default function BaseInput({
  label,
  error,
  leftIcon,
  rightIcon,
  className = '',
  id,
  required = false,
  ...props
}) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-0.5">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          required={required}
          className={`block w-full rounded-lg border text-sm outline-none transition-all duration-200 ${
            error 
              ? 'border-rose-300 text-rose-900 placeholder-rose-300 focus:border-rose-500 focus:ring-rose-100' 
              : 'border-slate-200 text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100'
          } ${leftIcon ? 'pl-10' : 'pl-3'} ${rightIcon ? 'pr-10' : 'pr-3'} py-2`}
          {...props}
        />
        {rightIcon && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-rose-600 font-semibold" id={`${inputId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
