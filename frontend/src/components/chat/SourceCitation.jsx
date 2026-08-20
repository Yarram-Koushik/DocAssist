import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export const SourceCitation = ({ title, snippet, link }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="mt-2 border rounded-md border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="w-full flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <span className="flex items-center text-gray-700 dark:text-gray-300">
          <BookOpen className="h-3 w-3 mr-2" />
          {title}
        </span>
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {expanded && (
        <div className="p-3 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs">
          <p>{snippet}</p>
          {link && <a href={link} target="_blank" rel="noreferrer" className="text-primary hover:underline mt-2 inline-block">Read more</a>}
        </div>
      )}
    </div>
  );
};
