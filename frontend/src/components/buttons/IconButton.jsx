import React from 'react';

/**
 * Reusable IconButton component.
 * @param {object} props
 * @param {React.ReactNode} props.icon - Lucide or custom icon node.
 * @param {function} [props.onClick]
 * @param {boolean} [props.disabled]
 * @param {string} [props.title] - Tooltip title text.
 * @param {string} [props.className]
 * @param {string} [props.variant] - 'primary', 'secondary', 'danger', 'ghost'
 */
export default function IconButton({
  icon,
  onClick,
  disabled = false,
  title,
  className = '',
  variant = 'secondary'
}) {
  const baseStyle = 'inline-flex items-center justify-center rounded-lg p-1.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100',
    secondary: 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700',
    danger: 'bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100',
    ghost: 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 border border-transparent'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseStyle} ${variants[variant] || variants.secondary} ${className}`}
    >
      {icon}
    </button>
  );
}
