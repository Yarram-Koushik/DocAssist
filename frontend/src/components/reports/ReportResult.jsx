import React from 'react';

export const ReportResult = ({ result }) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">AI Summary</h4>
        <p className="text-sm">{result.summary}</p>
      </div>
    </div>
  );
};
