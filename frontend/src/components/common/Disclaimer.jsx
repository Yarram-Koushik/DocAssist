import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Disclaimer = ({ compact = false, className }) => (
  <div className={cn("bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-md flex items-start space-x-3", className)}>
    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
    <div className={cn("text-sm", compact ? "text-xs" : "")}>
      <strong>Medical Disclaimer:</strong> DocAssist provides general information and analysis. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
    </div>
  </div>
);
