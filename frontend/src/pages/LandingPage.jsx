import React from 'react';
import { GraduationCap, ShieldCheck, Building2, CheckCircle2, ArrowRight, Lock } from 'lucide-react';

export default function LandingPage({ onSelectAction }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base">AICTE Compliance & Scrutiny</span>
              <span className="ml-2 bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2 py-0.5 rounded">SIH26261</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectAction('official-login')}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-300 rounded-xl transition"
            >
              Official Login
            </button>
            <button
              onClick={() => onSelectAction('register')}
              className="px-4 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs transition"
            >
              Register Institution
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 py-16 text-center space-y-8">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
            Smart India Hackathon • SIH26261
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
            AI-Powered Application Validation & Regulatory Scrutiny
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            Automating compliance verification against 140 AICTE handbook rules, authenticating statutory documents, and streamlining official scrutiny committee workflows.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onSelectAction('institution-login')}
            className="w-full sm:w-auto px-6 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm shadow-sm transition flex items-center justify-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            Institution Portal Login
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectAction('register')}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl text-sm border border-slate-300 shadow-xs transition"
          >
            Register New Institution Account
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-9 h-9 bg-sky-100 text-sky-700 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Dynamic Checklist Engine</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              140 versioned regulatory requirements extracted from AICTE Handbook Annexures 1 & 2 tailored to New Institution and EoA categories.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-9 h-9 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Automated AI Scrutiny</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instant PDF clause-level extraction powered by Groq LLM with citations to handbook pages, stamps, and validity dates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Role-Gated Reviewer Desk</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Side-by-side evidence inspection, one-click deficiency notices with automated Gmail dispatch, and auditable override tracking.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div>Built for Smart India Hackathon • Problem Statement SIH26261</div>
          <div className="flex gap-4">
            <button onClick={() => onSelectAction('official-login')} className="hover:text-slate-700">Official Login</button>
            <span>•</span>
            <button onClick={() => onSelectAction('admin-login')} className="hover:text-slate-700">Admin Login</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
