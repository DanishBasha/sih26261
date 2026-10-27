import React from 'react';
import { BookOpen } from 'lucide-react';

export default function RuleEvidence({ clause, annexure, printedPage, requirementText }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
      <div className="flex items-center gap-2 text-sky-700 font-semibold">
        <BookOpen className="w-3.5 h-3.5" />
        <span>{annexure || 'Annexure'} • Clause {clause} {printedPage ? `(p. ${printedPage})` : ''}</span>
      </div>
      <p className="text-slate-600">{requirementText}</p>
    </div>
  );
}
