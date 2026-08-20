import React from 'react';
import { cn } from '../../lib/utils';
import { ShieldAlert, ThumbsUp, ThumbsDown } from 'lucide-react';

export const MessageBubble = ({ message, isEmergency }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[80%] rounded-lg p-3 relative group",
        isUser ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
        isEmergency && "border-2 border-red-500 bg-red-50 dark:bg-red-900/20"
      )}>
        {isEmergency && <ShieldAlert className="absolute -top-3 -right-3 text-red-500 h-6 w-6 bg-white rounded-full" />}
        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        {!isUser && (
          <div className="mt-2 flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="text-gray-500 hover:text-green-500"><ThumbsUp className="h-3 w-3" /></button>
            <button className="text-gray-500 hover:text-red-500"><ThumbsDown className="h-3 w-3" /></button>
          </div>
        )}
      </div>
    </div>
  );
};
