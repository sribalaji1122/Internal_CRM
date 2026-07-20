import React from 'react';

/**
 * Reusable PageHeader component for standard module page headers.
 * @param {object} props
 * @param {string} props.title - The heading text.
 * @param {string} [props.description] - Subheading context details.
 * @param {React.ReactNode} [props.actions] - Right-side buttons/actions.
 */
export default function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
