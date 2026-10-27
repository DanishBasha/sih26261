import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs">
      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
