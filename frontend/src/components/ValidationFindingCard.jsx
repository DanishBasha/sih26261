import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ValidationFindingCard({ finding, onOverride, onDeficiency }) {
  if (!finding) return null;

  const isPassed = finding.finding_type === 'passed';
  const isDeficiency = finding.finding_type === 'deficiency';

  return (
    <div className={`p-4 rounded-xl border text-xs space-y-2 ${
      finding.is_overridden ? 'bg-purple-50 border-purple-200 text-purple-900' :
      isPassed ? 'bg-emerald-50 border-emerald-200 text-emerald-950' :
      isDeficiency ? 'bg-rose-50 border-rose-200 text-rose-950' :
      'bg-amber-50 border-amber-200 text-amber-950'
    }`}>
      <div className="flex items-center justify-between">
        <span className="font-bold flex items-center gap-1.5 text-sm">
          <Sparkles className="w-4 h-4" />
          {finding.message}
        </span>
        <span className="font-mono text-[11px] opacity-75">
          Clause: {finding.clause_reference}
        </span>
      </div>

      <p className="leading-relaxed opacity-90">{finding.explanation}</p>

      {finding.evidence_snippet && (
        <div className="p-2.5 bg-white/70 rounded-lg border border-slate-200/50 font-mono text-[11px] text-slate-700">
          <strong>Extracted Evidence:</strong> "{finding.evidence_snippet}"
        </div>
      )}

      {finding.override_reason && (
        <div className="mt-2 text-purple-800 font-semibold bg-purple-100/60 p-2 rounded">
          Official Override: "{finding.override_reason}" (by {finding.reviewed_by})
        </div>
      )}
    </div>
  );
}
