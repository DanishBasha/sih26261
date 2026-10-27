import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Filter, CheckCircle2, AlertTriangle, FileText, ExternalLink } from 'lucide-react';

export default function RulesCatalog() {
  const [rules, setRules] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [annexure, setAnnexure] = useState('');

  useEffect(() => {
    fetchRules();
  }, [search, annexure]);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (annexure) params.append('annexure', annexure);
      params.append('limit', '100');

      const res = await fetch(`/api/rules?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRules(data.rules);
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Error fetching rules:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-600" />
            AICTE Regulatory Rule Register (Annexures 1 & 2)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Database of 140 extracted rules from AICTE Approval Process Handbook (2024–25 to 2026–27).
          </p>
        </div>
        <div className="bg-sky-50 text-sky-700 px-4 py-2 rounded-lg text-sm font-semibold border border-sky-100">
          Total Rules Indexed: {total}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by rule ID, clause (e.g. 1.1(v)), or requirement keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div>
          <select
            value={annexure}
            onChange={(e) => setAnnexure(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Annexures</option>
            <option value="Annexure 1">Annexure 1 (New Institutions)</option>
            <option value="Annexure 2">Annexure 2 (EoA & Changes)</option>
          </select>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading AICTE rule catalog...</div>
        ) : rules.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No matching rules found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Rule ID & Clause</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Requirement Text</th>
                  <th className="py-3 px-4">Applicability</th>
                  <th className="py-3 px-4 text-center">Handbook Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map((rule) => (
                  <tr key={rule.rule_id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-sky-700">{rule.rule_id}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {rule.annexure} • Cl. {rule.source_clause}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium">
                        {rule.application_category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-normal text-slate-700 leading-relaxed max-w-md">
                      {rule.requirement_text}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 max-w-xs">
                      {rule.applicability_condition}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-xs font-semibold text-slate-600">
                      {rule.printed_page ? `p. ${rule.printed_page}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
