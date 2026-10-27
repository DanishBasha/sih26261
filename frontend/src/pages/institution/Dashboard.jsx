import React, { useState, useEffect } from 'react';
import { Building2, FileCheck, ArrowRight, Clock, PlusCircle } from 'lucide-react';
import { applicationsApi } from '../../services/applications.api';
import StatusBadge from '../../components/StatusBadge';

export default function Dashboard({ onNavigateNew }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsApi.list()
      .then(res => setApps(res.applications || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Institution Filing Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1">Manage and track AICTE approval submissions.</p>
        </div>
        <button
          onClick={onNavigateNew}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          Start New Application
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-800">
          Your Submitted Applications ({apps.length})
        </div>
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading applications...</div>
        ) : apps.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No applications found. Click "Start New Application" to begin!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {apps.map((app) => (
              <div key={app.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800">{app.application_number}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="text-sm font-semibold text-slate-700 mt-1">{app.institution_name}</div>
                  <div className="text-xs text-slate-400">{app.category}</div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <div>Documents: <span className="font-semibold text-slate-700">{app.document_count || 0}</span></div>
                  <div>Deficiencies: <span className="font-semibold text-rose-600">{app.deficiency_count || 0}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
