import React from 'react';
import { AlertCircle, CheckCircle, ArrowDown, ArrowUp, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ValueCard = ({ name, value, unit, status, range }) => {
  const normalizedStatus = (status || '').toLowerCase();
  const isLow = normalizedStatus === 'low' || normalizedStatus === 'below';
  const isHigh = normalizedStatus === 'high' || normalizedStatus === 'above';
  const isAbnormal = isLow || isHigh;

  return (
    <div className={cn(
      "p-5 rounded-xl border transition-all duration-200 shadow-sm",
      isLow && "border-amber-400 bg-amber-50/70 dark:bg-amber-950/20 dark:border-amber-700/60",
      isHigh && "border-rose-400 bg-rose-50/70 dark:bg-rose-950/20 dark:border-rose-700/60",
      !isAbnormal && "border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark hover:border-gray-300"
    )}>
      <div className="flex justify-between items-start mb-3">
        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{name}</span>
        {isLow && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            <ArrowDown className="h-3 w-3" /> Low
          </span>
        )}
        {isHigh && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
            <ArrowUp className="h-3 w-3" /> High
          </span>
        )}
        {!isAbnormal && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCircle className="h-3 w-3" /> Normal
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">{value}</span>
        {unit && <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{unit}</span>}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 pt-1 border-t border-gray-100 dark:border-gray-800/80">
        <span>Standard Ref:</span>
        <span className="font-medium text-gray-700 dark:text-gray-300">{range || 'N/A'}</span>
      </div>
    </div>
  );
};

