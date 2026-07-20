import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import IconButton from '../buttons/IconButton';

/**
 * Reusable Toast notification component.
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {string} props.message
 * @param {string} [props.type] - 'success' | 'error' | 'warning' | 'info'
 * @param {function} props.onClose
 * @param {number} [props.duration] - Time in ms before auto-closing. Defaults to 4000.
 */
export default function Toast({
  isOpen,
  message,
  type = 'success',
  onClose,
  duration = 4000
}) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50 border-emerald-100 shadow-emerald-100/10 text-emerald-800',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
    },
    error: {
      bg: 'bg-rose-50 border-rose-100 shadow-rose-100/10 text-rose-800',
      icon: <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
    },
    warning: {
      bg: 'bg-amber-50 border-amber-100 shadow-amber-100/10 text-amber-800',
      icon: <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
    },
    info: {
      bg: 'bg-blue-50 border-blue-100 shadow-blue-100/10 text-blue-800',
      icon: <Info className="h-5 w-5 text-blue-500 shrink-0" />
    }
  };

  const config = typeConfig[type] || typeConfig.success;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-in max-w-sm w-full">
      <div className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg bg-white ${config.bg}`}>
        {config.icon}
        <div className="flex-1 text-sm font-semibold leading-relaxed">
          {message}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
