import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const EmergencyAlert = ({ message, onDismiss }) => (
  <div className="bg-red-500 text-white p-4 rounded-md shadow-lg flex items-start space-x-3 mb-4 animate-pulse">
    <ShieldAlert className="h-6 w-6 shrink-0 mt-0.5" />
    <div className="flex-1">
      <h3 className="font-bold">Emergency Detected</h3>
      <p className="text-sm mt-1">{message}</p>
      <div className="mt-3 flex space-x-3">
        <a href="tel:911" className="bg-white text-red-600 px-4 py-2 rounded font-bold text-sm hover:bg-gray-100">Call Emergency Services</a>
        <button onClick={onDismiss} className="px-4 py-2 rounded text-sm hover:bg-red-600 border border-white">Dismiss</button>
      </div>
    </div>
  </div>
);
