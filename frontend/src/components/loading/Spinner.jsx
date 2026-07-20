import React from 'react';

/**
 * Reusable loading spinner.
 * @param {object} props
 * @param {string} [props.size] - 'sm' | 'md' | 'lg'
 * @param {string} [props.className]
 */
export default function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div
        className={`animate-spin rounded-full border-slate-200 border-t-indigo-600 ${sizeClasses[size] || sizeClasses.md}`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
}
