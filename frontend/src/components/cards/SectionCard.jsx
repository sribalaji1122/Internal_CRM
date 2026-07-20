import React from 'react';

/**
 * Reusable SectionCard component for structured page elements.
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.title] - Optional title for the card header.
 * @param {React.ReactNode} [props.headerActions] - Optional header actions to show on the right.
 * @param {React.ReactNode} [props.footer] - Optional footer content.
 * @param {string} [props.className] - Additional Tailwind classes.
 * @param {boolean} [props.hoverable] - If true, applies hover shadow effects.
 */
export default function SectionCard({
  children,
  title,
  headerActions,
  footer,
  className = '',
  hoverable = false
}) {
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 ${
      hoverable ? 'hover:shadow-md hover:border-slate-300' : ''
    } ${className}`}>
      {/* Card Header */}
      {(title || headerActions) && (
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          {title && <h3 className="font-semibold text-slate-800">{title}</h3>}
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}

      {/* Card Body */}
      <div className="p-5">{children}</div>

      {/* Card Footer */}
      {footer && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}
