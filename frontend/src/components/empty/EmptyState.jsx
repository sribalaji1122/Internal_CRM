import React from 'react';

/**
 * Reusable EmptyState component.
 * @param {object} props
 * @param {React.ReactNode} props.icon - Icon node.
 * @param {string} props.title - Heading title.
 * @param {string} props.description - Explanatory details.
 * @param {React.ReactNode} [props.actionButton] - Optional call to action button.
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionButton
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-12 md:py-16 bg-white rounded-xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200/60 text-slate-400 mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-800 tracking-tight">{title}</h3>
      <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">{description}</p>
      {actionButton && <div className="mt-6">{actionButton}</div>}
    </div>
  );
}
