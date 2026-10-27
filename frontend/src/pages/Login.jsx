import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, switchRole } = useAuth();
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md mx-auto text-center space-y-4">
      <h2 className="text-xl font-bold text-slate-800">AICTE Scrutiny Portal Sign In</h2>
      <p className="text-xs text-slate-500">Currently signed in as: <strong className="text-slate-800 capitalize">{user.role}</strong></p>
      <div className="flex justify-center gap-2 pt-2">
        <button onClick={() => switchRole('institution')} className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-semibold">
          Institution Portal
        </button>
        <button onClick={() => switchRole('official')} className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold">
          Reviewer Portal
        </button>
      </div>
    </div>
  );
}
