import React, { useState, useEffect } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { rulesApi } from '../../services/rules.api';

export default function RuleManagement() {
  const [rules, setRules] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    rulesApi.list(`search=${search}&limit=100`)
      .then(res => setRules(res.rules || []))
      .catch(console.error);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Regulatory Rule Register Management</h2>
          <p className="text-xs text-slate-500 mt-1">Review, approve, and manage versioned AICTE handbook rules.</p>
        </div>
        <div className="text-xs font-semibold px-3 py-1 bg-sky-50 text-sky-700 rounded-lg border border-sky-100">
          Rules in Catalog: {rules.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <input
            type="text"
            placeholder="Filter by rule ID, clause, or requirement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
          {rules.map((rule) => (
            <div key={rule.rule_id} className="p-4 hover:bg-slate-50 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-sky-700">{rule.rule_id} (Clause {rule.source_clause})</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {rule.verification_status}
                </span>
              </div>
              <p className="text-slate-700">{rule.requirement_text}</p>
              <p className="text-[11px] text-slate-400">{rule.application_category} • {rule.annexure}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
