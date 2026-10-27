import React from 'react';
import { Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function InstitutionProfile() {
  const { user } = useAuth();
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-xl mx-auto space-y-4">
      <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
        <Building2 className="w-5 h-5 text-sky-600" />
        Institution Profile
      </h3>
      <div className="space-y-3 text-xs text-slate-600">
        <div><strong>Contact Email:</strong> {user.email}</div>
        <div><strong>Affiliation Status:</strong> Active Applicant</div>
        <div><strong>Regulatory Cycle:</strong> 2025–2026 AICTE Handbook Scrutiny</div>
      </div>
    </div>
  );
}
