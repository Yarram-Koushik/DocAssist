import React from 'react';

export const LoadingSpinner = ({ text }) => (
  <div className="flex flex-col items-center justify-center space-y-2">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    {text && <span className="text-sm text-gray-500 dark:text-gray-400">{text}</span>}
  </div>
);
