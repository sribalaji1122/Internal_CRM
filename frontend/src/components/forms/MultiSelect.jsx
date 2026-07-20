import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

export default function MultiSelect({
  label,
  options = [],
  selectedValues = [],
  onChange,
  placeholder = 'Select options...',
  error
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(val => val !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const removeValue = (e, value) => {
    e.stopPropagation();
    onChange(selectedValues.filter(val => val !== value));
  };

  const getSelectedLabels = () => {
    return options.filter(opt => selectedValues.includes(opt.value));
  };

  return (
    <div className="flex flex-col gap-1.5 w-full text-left" ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`flex min-h-[42px] w-full flex-wrap items-center justify-between gap-1.5 rounded-xl border bg-white px-3.5 py-2 text-sm shadow-sm transition-all duration-200 cursor-pointer focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 ${
            error ? 'border-rose-300 focus-within:border-rose-500 focus-within:ring-rose-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          {selectedValues.length === 0 ? (
            <span className="text-slate-400 select-none">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {getSelectedLabels().map(opt => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700"
                >
                  {opt.label}
                  <button
                    type="button"
                    onClick={(e) => removeValue(e, opt.value)}
                    className="rounded bg-indigo-100/50 p-0.5 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-150 bg-white p-1.5 shadow-lg animate-in fade-in-50 slide-in-from-top-1 duration-150">
            {options.length === 0 ? (
              <div className="py-3 px-4 text-center text-xs text-slate-400 font-medium">
                No options available
              </div>
            ) : (
              options.map(opt => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition cursor-pointer ${
                      isSelected ? 'bg-indigo-50/50 font-semibold text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      {error && <span className="text-[10px] font-bold text-rose-500">{error}</span>}
    </div>
  );
}
