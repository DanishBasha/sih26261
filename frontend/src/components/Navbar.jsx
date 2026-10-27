import React from 'react';
import { GraduationCap, LogOut, Building2, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, switchRole, logout } = useAuth();
  const role = user?.role === 'institution_user' ? 'institution' : user?.role || 'institution';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base leading-tight">AICTE Scrutiny & Compliance</span>
                <span className="bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">SIH26261</span>
              </div>
              <p className="text-xs text-slate-500">
                {user?.institution?.legal_name 
                  ? user.institution.legal_name 
                  : 'AI-Powered Regulatory Validation & Authentication'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Role Switcher for Evaluator Convenience */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
              <span className="text-[11px] font-medium text-slate-400 px-2">Role:</span>
              <button
                onClick={() => switchRole('institution')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${role === 'institution' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'}`}
              >
                Inst
              </button>
              <button
                onClick={() => switchRole('official')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${role === 'official' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'}`}
              >
                Official
              </button>
              <button
                onClick={() => switchRole('admin')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${role === 'admin' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'}`}
              >
                Admin
              </button>
            </div>

            {/* User Profile & Sign Out */}
            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {user.full_name || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">{role}</div>
                </div>

                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs uppercase">
                  {user.full_name ? user.full_name[0] : (user.email ? user.email[0] : 'U')}
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
