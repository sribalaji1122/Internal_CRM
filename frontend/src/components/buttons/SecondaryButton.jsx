import React from 'react';

/**
 * Reusable Secondary Button component.
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {function} [props.onClick]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.loading]
 * @param {string} [props.type]
 * @param {string} [props.className]
 */
export default function SecondaryButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = ''
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-700" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
