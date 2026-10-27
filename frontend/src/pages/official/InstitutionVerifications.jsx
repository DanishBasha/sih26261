import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  RefreshCw, 
  ExternalLink,
  UserCheck,
  Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function InstitutionVerifications() {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState([]);
  const [selectedInst, setSelectedInst] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [remarks, setRemarks] = useState('');
  const [toast, setToast] = useState(null);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/institution-verifications', {
        headers: {
          'x-user-id': user?.id,
          'x-user-role': user?.role === 'admin' ? 'admin' : 'official'
        }
      });
      const data = await res.json();
      if (data.verifications) {
        setVerifications(data.verifications);
        if (!selectedInst && data.verifications.length > 0) {
          setSelectedInst(data.verifications[0]);
        } else if (selectedInst) {
          const updated = data.verifications.find(v => v.id === selectedInst.id);
          if (updated) setSelectedInst(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleReview = async (decision) => {
    if (!selectedInst) return;
    if ((decision === 'rejected' || decision === 'additional_information_required') && !remarks.trim()) {
      alert('Please provide official remarks/reasons for this decision.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/institution-verifications/${selectedInst.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id,
          'x-user-role': user?.role === 'admin' ? 'admin' : 'official'
        },
        body: JSON.stringify({
          decision,
          remarks: remarks.trim() || 'Verified by AICTE Scrutiny Committee'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setToast(`Institution marked as "${decision}" successfully!`);
      setRemarks('');
      await fetchVerifications();
    } catch (err) {
      alert(`Error reviewing institution: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = verifications.filter(v => {
    const matchesFilter = filterStatus === 'all' || v.verification_status === filterStatus;
    const matchesSearch = !searchQuery || 
      v.legal_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.aicte_permanent_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.state?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex justify-between items-center shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="uppercase font-bold text-[10px] text-emerald-700 hover:text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">Institution Verification Queue</h1>
            <span className="bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
              AICTE Directorate
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authenticate registered institutions, permanent IDs, and representative legal entity filings before application issuance.
          </p>
        </div>

        <button
          onClick={fetchVerifications}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'all' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'}`}
          >
            All ({verifications.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending_verification')}
            className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'pending_verification' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'}`}
          >
            Pending Review ({verifications.filter(v => v.verification_status === 'pending_verification').length})
          </button>
          <button
            onClick={() => setFilterStatus('verified')}
            className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'verified' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}
          >
            Verified ({verifications.filter(v => v.verification_status === 'verified').length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, state..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Two Column Layout: List & Dossier Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between items-center">
            <span>Registered Institutions ({filtered.length})</span>
            <span className="text-[11px] font-normal text-slate-400">Select to inspect</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No institution verifications matching filters.
              </div>
            ) : (
              filtered.map((inst) => {
                const isSelected = selectedInst?.id === inst.id;
                const status = inst.verification_status || 'pending_verification';

                return (
                  <div
                    key={inst.id}
                    onClick={() => {
                      setSelectedInst(inst);
                      setRemarks(inst.remarks || '');
                    }}
                    className={`p-4 cursor-pointer transition ${
                      isSelected ? 'bg-sky-50/80 border-l-4 border-sky-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-xs text-slate-900 line-clamp-1">
                        {inst.legal_name || 'Unnamed Institution'}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : status === 'pending_verification'
                            ? 'bg-amber-100 text-amber-800'
                            : status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="font-mono text-slate-600">{inst.aicte_permanent_id || 'ID Pending'}</span>
                      <span>{inst.state || 'India'}</span>
                    </div>

                    {inst.official_email && (
                      <div className="text-[10px] text-slate-400 mt-1 truncate">
                        {inst.official_email}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Dossier Inspector & Decision Actions */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          {selectedInst ? (
            <>
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Institution Verification Dossier
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">{selectedInst.legal_name}</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    AICTE Permanent ID: <strong className="text-slate-800">{selectedInst.aicte_permanent_id || 'Not Assigned'}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-[11px] font-bold uppercase px-3 py-1 rounded-full ${
                      selectedInst.verification_status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedInst.verification_status === 'pending_verification'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedInst.verification_status?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Dossier Information Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] block">Institution Type</span>
                  <strong className="text-slate-800">{selectedInst.institution_type || 'Private Un-Aided'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">State & District</span>
                  <strong className="text-slate-800">{selectedInst.state || 'N/A'}, {selectedInst.district || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Official Email</span>
                  <strong className="text-slate-800">{selectedInst.official_email || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Contact Number</span>
                  <strong className="text-slate-800">{selectedInst.contact_number || 'N/A'}</strong>
                </div>
                {selectedInst.website && (
                  <div className="col-span-2">
                    <span className="text-slate-400 text-[10px] block">Official Website</span>
                    <a
                      href={selectedInst.website.startsWith('http') ? selectedInst.website : `https://${selectedInst.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-600 font-medium hover:underline inline-flex items-center gap-1"
                    >
                      {selectedInst.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Scrutiny Actions & Remarks Box */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Official Scrutiny Committee Remarks
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter scrutiny findings, society deed verification note, or deficiency rationale..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => handleReview('verified')}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve & Verify Institution
                  </button>
                  <button
                    onClick={() => handleReview('additional_information_required')}
                    disabled={actionLoading}
                    className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Request Additional Info
                  </button>
                  <button
                    onClick={() => handleReview('rejected')}
                    disabled={actionLoading}
                    className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Building2 className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">Select an institution from the list to review verification documents.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
