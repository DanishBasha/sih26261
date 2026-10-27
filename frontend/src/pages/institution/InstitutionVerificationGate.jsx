import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ArrowRight, 
  LogOut, 
  ShieldCheck,
  FileText,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function InstitutionVerificationGate({ onVerified, onLogout }) {
  const { user, updateUser } = useAuth();
  const [institution, setInstitution] = useState(user?.institution || null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [remarks, setRemarks] = useState('');

  // Edit fields for resubmission if info requested
  const [legalName, setLegalName] = useState(user?.institution?.legal_name || '');
  const [aicteId, setAicteId] = useState(user?.institution?.aicte_permanent_id || '');
  const [district, setDistrict] = useState('');
  const [website, setWebsite] = useState('');

  const fetchStatus = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/institution/verification-status', {
        headers: { 'x-user-id': user?.id }
      });
      const data = await res.json();
      if (data.institution) {
        setInstitution(data.institution);
        updateUser({ institution: data.institution });
        if (data.institution.verification_status === 'verified') {
          onVerified?.();
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Demo fast-track approval button for hackathon judges
  const handleFastTrackApprove = async () => {
    if (!institution?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/institution-verifications/${institution.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-role': 'admin'
        },
        body: JSON.stringify({
          decision: 'verified',
          remarks: 'Fast-track verification approved for SIH26261 evaluation.'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      await fetchStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // 1. Update details
      await fetch('/api/institution/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          legal_name: legalName,
          aicte_permanent_id: aicteId,
          district,
          website
        })
      });

      // 2. Submit for verification
      const res = await fetch('/api/institution/submit-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      await fetchStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const status = institution?.verification_status || 'pending_verification';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">AICTE Scrutiny System</h1>
              <p className="text-[11px] text-slate-500">Institution Portal Verification Gate</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-white rounded-lg border border-slate-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {status === 'pending_verification' && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 tracking-wide mb-1">
                    Verification In Progress
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Institution Verification Pending
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Your institution registration has been received and is currently in the official scrutiny queue. AICTE Regional Committee Officers authenticate the Society Deed, AISHE ID, and land documents before application creation is enabled.
                  </p>
                </div>
              </div>

              {/* Submitted Details Review Box */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Dossier Details Under Review
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Institution Legal Name:</span>
                    <strong className="text-slate-800">{institution?.legal_name || 'Apex Institute of Technology'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">AICTE Permanent ID / AISHE:</span>
                    <strong className="text-slate-800">{institution?.aicte_permanent_id || 'AICTE-1-987654321'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Authorized Representative:</span>
                    <strong className="text-slate-800">{user?.full_name} ({user?.email})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">State / District:</span>
                    <strong className="text-slate-800">{institution?.state || 'Maharashtra'}, {institution?.district || 'Pune'}</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  What can you access while pending?
                </p>
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  You can inspect the 140 AICTE Regulatory Rules, review handbook annexures, and read the application guidance. Regulatory submission will unlock immediately once verified.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={fetchStatus}
                  disabled={refreshing}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Checking AICTE Server...' : 'Refresh Status'}
                </button>
                <button
                  onClick={handleFastTrackApprove}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {loading ? 'Approving...' : 'Fast-Track Verify (Demo)'}
                </button>
              </div>
            </div>
          )}

          {status === 'verified' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Institution Officially Verified!</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your institution profile has been validated by AICTE Scrutiny Officers. You now have full clearance to start new applications and submit statutory documentation.
              </p>
              <button
                onClick={onVerified}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs"
              >
                Enter Institution Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {(status === 'additional_information_required' || status === 'rejected') && (
            <form onSubmit={handleResubmit} className="space-y-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl ${status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'} flex items-center justify-center shrink-0`}>
                  {status === 'rejected' ? <XCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'} tracking-wide mb-1`}>
                    {status === 'rejected' ? 'Verification Rejected' : 'Additional Information Required'}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    AICTE Scrutiny Officer Remarks
                  </h2>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 mt-2 font-mono">
                    "{institution?.remarks || 'Please verify AISHE registration code and update your official web portal link.'}"
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase">Update Details to Resubmit</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Legal Name</label>
                    <input
                      type="text"
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">AICTE Permanent ID</label>
                    <input
                      type="text"
                      value={aicteId}
                      onChange={(e) => setAicteId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {loading ? 'Resubmitting...' : 'Resubmit for Verification'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
