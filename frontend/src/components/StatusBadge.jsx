import React from 'react';
import { STATUS_COLORS } from '../utils/statusLabels';

export default function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${color}`}>
      {status || 'Unknown'}
    </span>
  );
}
