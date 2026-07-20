import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import IconButton from '../buttons/IconButton';

/**
 * Reusable Modal component.
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {function} props.onClose
 * @param {string} props.title - Modal title heading.
 * @param {React.ReactNode} props.children - Modal body.
 * @param {React.ReactNode} [props.footer] - Action buttons at the bottom.
 * @param {string} [props.size] - 'sm', 'md', 'lg', 'xl'
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}) {
  const overlayRef = useRef(null);

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Sizes mapper
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  const handleOverlayClick = (e) => {
    if (overlayRef.current === e.target) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Dark Blur Overlay */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="flex min-h-screen items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm transition-opacity duration-300"
      >
        {/* Modal Container */}
        <div
          className={`w-full transform overflow-hidden rounded-xl bg-white shadow-xl border border-slate-200/50 transition-all duration-300 ${sizeClasses[size] || sizeClasses.md}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            <IconButton
              variant="ghost"
              icon={<X className="h-4.5 w-4.5" />}
              onClick={onClose}
              title="Close modal"
            />
          </div>

          {/* Body */}
          <div className="px-6 py-5 max-h-[70vh] overflow-y-auto text-sm text-slate-600 leading-relaxed">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
