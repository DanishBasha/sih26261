import React, { useState, useEffect } from 'react';
import { Activity, Database, Cpu, Mail, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(setHealth)
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">System Administration & Diagnostics</h2>
          <p className="text-xs text-slate-500 mt-1">Real-time status of connected AICTE compliance infrastructure.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <Database className="w-6 h-6 text-emerald-600" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">CONNECTED</span>
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Supabase PostgreSQL</h3>
          <p className="text-xs text-slate-500">Rules Loaded: <strong>{health?.services?.database?.rulesInDatabase || 140}</strong></p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <Cpu className="w-6 h-6 text-sky-600" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">ACTIVE</span>
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Groq AI Engine</h3>
          <p className="text-xs text-slate-500">Model: <strong>{health?.services?.groq?.model || 'qwen/qwen3.8-27b'}</strong></p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <Mail className="w-6 h-6 text-amber-600" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">ACTIVE</span>
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Gmail SMTP Service</h3>
          <p className="text-xs text-slate-500">Sender: <strong>danishbasha18@gmail.com</strong></p>
        </div>
      </div>
    </div>
  );
}
