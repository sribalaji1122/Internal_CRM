import React from 'react';
import { ArrowLeft, Edit2, X } from 'lucide-react';
import StatusBadge from '../badges/StatusBadge';
import SectionCard from '../cards/SectionCard';
import PrimaryButton from '../buttons/PrimaryButton';
import OutlineButton from '../buttons/OutlineButton';

export default function EntityDetailsLayout({
  title,
  subtitle,
  avatarText,
  status,
  summaryCards = [],
  tabs = [],
  activeTab,
  onTabChange,
  onEditClick,
  onClose,
  children
}) {
  return (
    <div className="flex flex-col h-full bg-slate-900/10 dark:bg-slate-950/20 rounded-2xl overflow-hidden">
      {/* 1. Header Banner */}
      <div className="p-6 bg-slate-950 text-slate-100 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          
          {avatarText && (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-extrabold text-xl shadow-lg shrink-0">
              {avatarText}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
              {status && <StatusBadge status={status} />}
            </div>
            {subtitle && <p className="text-xs text-slate-450 mt-1 font-semibold">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEditClick && (
            <PrimaryButton onClick={onEditClick}>
              <Edit2 className="h-4 w-4" />
              Edit details
            </PrimaryButton>
          )}
          {onClose && (
            <OutlineButton onClick={onClose} className="border-slate-800 text-slate-350 hover:bg-slate-800/80 hover:text-white">
              <X className="h-4 w-4" />
              Close
            </OutlineButton>
          )}
        </div>
      </div>

      {/* 2. Summary Cards Grid */}
      {summaryCards && summaryCards.length > 0 && (
        <div className="bg-slate-950/50 p-4 border-b border-slate-800/40">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-3 overflow-x-auto max-h-[160px] pb-1">
            {summaryCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="min-w-[100px] flex-1 bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 text-center flex flex-col justify-center items-center shadow-sm"
                >
                  {Icon && (
                    <div className="p-1 rounded bg-slate-800/40 border border-slate-700/30 text-indigo-400 mb-1">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-450 truncate max-w-full block">
                    {card.label}
                  </span>
                  <span className="text-sm font-extrabold text-slate-200 mt-1">
                    {card.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Tabbed Navigation */}
      {tabs && tabs.length > 0 && (
        <div className="border-b border-slate-200 bg-white dark:bg-slate-900/40 dark:border-slate-800">
          <div className="flex overflow-x-auto px-4 gap-2 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.icon && <tab.icon className="h-3.5 w-3.5 shrink-0" />}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-650 dark:bg-slate-800'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Tab Content Container */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/10">
        {children}
      </div>
    </div>
  );
}
