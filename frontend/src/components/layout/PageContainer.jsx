import React from 'react';

/**
 * PageContainer component to wrap pages.
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className] - Optional tailwind classes.
 */
export default function PageContainer({ children, className = '' }) {
  return (
    <div className={`mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
