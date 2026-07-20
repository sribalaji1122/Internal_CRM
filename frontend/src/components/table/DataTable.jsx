import React from 'react';
import SkeletonTable from '../loading/SkeletonTable';
import EmptyState from '../empty/EmptyState';
import { HelpCircle } from 'lucide-react';

/**
 * Reusable DataTable component for ApexCRM dashboards and listing queues.
 * @param {object} props
 * @param {Array} props.columns - Column configuration, e.g. [{ key: 'name', header: 'Name', render: (row) => ... }]
 * @param {Array} props.data - Array of records to display.
 * @param {boolean} [props.loading] - Renders loading table skeletons when true.
 * @param {string} [props.emptyTitle] - Title for empty state.
 * @param {string} [props.emptyDescription] - Subtext for empty state.
 * @param {React.ReactNode} [props.emptyIcon] - Custom icon for empty state.
 * @param {React.ReactNode} [props.emptyAction] - Custom action button/element for empty state.
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No Records Found',
  emptyDescription = 'There are no active records in this list.',
  emptyIcon,
  emptyAction
}) {
  if (loading) {
    return <SkeletonTable columnsCount={columns.length} rowsCount={5} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={emptyIcon || <HelpCircle className="h-10 w-10 text-slate-400" />}
          actionButton={emptyAction}
        />
      </div>
    );
  }

  return (
    <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          {/* Table Header */}
          <thead className="bg-slate-50/75 backdrop-blur-sm sticky top-0 border-b border-slate-200 z-10">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className={`transition-colors duration-150 hover:bg-slate-50/50 ${
                  rowIdx % 2 === 1 ? 'bg-slate-50/20' : ''
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    className="px-6 py-4 text-slate-700 font-medium whitespace-nowrap"
                  >
                    {col.render ? col.render(row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
