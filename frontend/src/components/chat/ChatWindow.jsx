import React from 'react';
import { cn } from '../../lib/utils';

export const ChatWindow = ({ children, className }) => (
  <div className={cn("flex-1 overflow-y-auto p-4 space-y-4", className)}>
    {children}
  </div>
);
