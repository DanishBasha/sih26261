import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-2 text-slate-400">
      <RefreshCw className="w-6 h-6 animate-spin text-sky-600" />
      <span className="text-xs font-medium">{message}</span>
    </div>
  );
}
