import React from 'react';
import { Building2, ShieldCheck, BookOpen, Activity, FileText, Bell, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();

  const institutionLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Building2 },
    { id: 'new-app', label: 'New Application', icon: FileText },
    { id: 'rules', label: 'Rules Catalog', icon: BookOpen },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const officialLinks = [
    { id: 'verifications', label: 'Institution Queue', icon: Building2 },
    { id: 'review', label: 'Scrutiny Dossiers', icon: ShieldCheck },
    { id: 'rules', label: 'Rules Catalog', icon: BookOpen },
    { id: 'notifications', label: 'Alerts', icon: Bell }
  ];

  const adminLinks = [
    { id: 'admin-dashboard', label: 'System Overview', icon: Activity },
    { id: 'verifications', label: 'Institution Queue', icon: Building2 },
    { id: 'rules', label: 'Rule Management', icon: BookOpen },
    { id: 'notifications', label: 'Audit & Logs', icon: Bell }
  ];

  const role = user?.role === 'institution_user' ? 'institution' : user?.role || 'institution';
  const links = role === 'official' ? officialLinks : role === 'admin' ? adminLinks : institutionLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)] p-4 space-y-1">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
        {role} Navigation
      </div>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = activeTab === link.id;
        return (
          <button
            key={link.id}
            onClick={() => setActiveTab(link.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              isActive ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
            {link.label}
          </button>
        );
      })}
    </aside>
  );
}
