import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  BookOpen, 
  Activity, 
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import InstitutionPortal from './components/InstitutionPortal';
import ReviewerPortal from './components/ReviewerPortal';
import RulesCatalog from './components/RulesCatalog';
import SystemHealth from './components/SystemHealth';

export default function App() {
  const [activeTab, setActiveTab] = useState('institution');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-slate-900 text-base leading-tight">
                    AICTE Scrutiny & Compliance
                  </h1>
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                    SIH26261
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  AI-Powered Application Validation & Document Authentication Platform
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('institution')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                  activeTab === 'institution'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Institution Portal
              </button>

              <button
                onClick={() => setActiveTab('reviewer')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                  activeTab === 'reviewer'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Official Reviewer
              </button>

              <button
                onClick={() => setActiveTab('rules')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                  activeTab === 'rules'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Rules Catalog
              </button>

              <button
                onClick={() => setActiveTab('health')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                  activeTab === 'health'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-4 h-4" />
                Diagnostics
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'institution' && <InstitutionPortal />}
        {activeTab === 'reviewer' && <ReviewerPortal />}
        {activeTab === 'rules' && <RulesCatalog />}
        {activeTab === 'health' && <SystemHealth />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div>
            Built for Smart India Hackathon • Problem Statement <strong className="text-slate-700 font-mono">SIH26261</strong>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>AICTE Approval Process Handbook (2024–25 to 2026–27)</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">Supabase • Groq • Gmail SMTP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
