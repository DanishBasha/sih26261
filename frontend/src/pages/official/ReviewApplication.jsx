import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  UserCheck, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Send,
  Building2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { applicationsApi } from '../../services/applications.api';
import { reviewsApi } from '../../services/reviews.api';
import StatusBadge from '../../components/StatusBadge';
import ValidationFindingCard from '../../components/ValidationFindingCard';

export default function ReviewApplication() {
  const [apps, setApps] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Deficiency Modal State
  const [showDeficiencyModal, setShowDeficiencyModal] = useState(false);
  const [deficiencyReason, setDeficiencyReason] = useState('');
  const [deficiencyClause, setDeficiencyClause] = useState('');

  // Anomaly Modal State (Approved with anomalies)
  const [showAnomalyModal, setShowAnomalyModal] = useState(false);
  const [anomalyText, setAnomalyText] = useState('');
  const [anomalyRemarks, setAnomalyRemarks] = useState('');

  // Reject Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectClause, setRejectClause] = useState('');

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const res = await applicationsApi.list();
      setApps(res.applications || []);
      if (res.applications?.length && !selectedId) {
        loadAppDetails(res.applications[0].id);
      }
    } catch (err) {
      console.error('Queue load error:', err);
    }
  };

  const loadAppDetails = async (id) => {
    setSelectedId(id);
    try {
      const data = await applicationsApi.getById(id);
      setDetails(data);
    } catch (err) {
      console.error('App detail error:', err);
    }
  };

  // 1. Approve Application
  const handleApprove = async () => {
    if (!confirm('Officially Approve this application? Formal certificate email will be dispatched to the institution.')) return;
    setLoading(true);
    try {
      await reviewsApi.approve({
        application_id: selectedId,
        remarks: 'All documents comply with AICTE Approval Process Handbook requirements.'
      });
      setToast('Application officially Approved! Congratulatory certificate email sent to institution.');
      await loadAppDetails(selectedId);
      await loadQueue();
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. Approve with Anomalies (Per SIH26261 Email Spec Section 1.5, 2.2)
  const handleApproveWithAnomalies = async (e) => {
    e.preventDefault();
    if (!anomalyText.trim()) {
      alert('Please specify the identified anomaly or conditional compliance requirement.');
      return;
    }
    setLoading(true);
    try {
      await reviewsApi.approveWithAnomalies({
        application_id: selectedId,
        anomalies: anomalyText.trim(),
        remarks: anomalyRemarks.trim() || 'Conditional approval subject to addressing identified anomalies before EVC inspection.'
      });
      setToast('Conditional Approval Granted! Institution decision email & Higher-Level Admin Oversight Alert dispatched.');
      setShowAnomalyModal(false);
      setAnomalyText('');
      setAnomalyRemarks('');
      await loadAppDetails(selectedId);
      await loadQueue();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 3. Reject Application (Per SIH26261 Email Spec Section 1.2, 2.3)
  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert('Please specify the authorized rejection reason and non-compliance grounds.');
      return;
    }
    setLoading(true);
    try {
      await reviewsApi.reject({
        application_id: selectedId,
        reason: rejectReason.trim(),
        clause: rejectClause.trim() || 'AICTE Approval Process Handbook Chapter I/II Norms'
      });
      setToast('Application officially Rejected. Formal rejection order email dispatched to institution.');
      setShowRejectModal(false);
      setRejectReason('');
      setRejectClause('');
      await loadAppDetails(selectedId);
      await loadQueue();
    } catch (err) {
      alert(`Rejection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 4. Raise Regulatory Deficiency
  const handleRaiseDeficiency = async (e) => {
    e.preventDefault();
    if (!deficiencyReason.trim()) return;
    setLoading(true);
    try {
      await reviewsApi.raiseDeficiency({
        application_id: selectedId,
        reason: deficiencyReason.trim(),
        clause: deficiencyClause.trim() || 'AICTE Norms'
      });
      setToast('Deficiency notice recorded & formal email dispatched to institution!');
      setShowDeficiencyModal(false);
      setDeficiencyReason('');
      setDeficiencyClause('');
      await loadAppDetails(selectedId);
      await loadQueue();
    } catch (err) {
      alert(`Deficiency error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex justify-between items-center shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="uppercase font-bold text-[10px] text-emerald-700 hover:text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Scrutiny Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-700 flex justify-between items-center">
            <span>Scrutiny Dossier Queue ({apps.length})</span>
            <button onClick={loadQueue} className="text-sky-600 hover:text-sky-700 font-semibold">Refresh</button>
          </div>
          <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
            {apps.map((app) => (
              <div
                key={app.id}
                onClick={() => loadAppDetails(app.id)}
                className={`p-4 cursor-pointer transition ${selectedId === app.id ? 'bg-sky-50 border-l-4 border-sky-600' : 'hover:bg-slate-50'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-xs font-bold text-slate-800">{app.application_number}</span>
                  <StatusBadge status={app.status} />
                </div>
                <div className="text-xs font-semibold text-slate-700 truncate">{app.institution_name}</div>
                <div className="text-[11px] text-slate-400 mt-1">{app.category?.slice(0, 32)}...</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dossier Detail View */}
        <div className="lg:col-span-8 space-y-6">
          {!details ? (
            <div className="bg-white p-12 text-center text-xs text-slate-400 rounded-2xl border border-slate-200">
              Select an application from the queue to start scrutiny.
            </div>
          ) : (
            <>
              {/* Header & Official Decision Bar */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-800">{details.application.institution_name}</h3>
                      <StatusBadge status={details.application.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      #{details.application.application_number} • {details.application.category} • AY {details.application.academic_year || '2025-26'}
                    </p>
                  </div>

                  <div className="text-xs text-slate-400">
                    Applicant: <strong className="text-slate-700">{details.application.institution_email}</strong>
                  </div>
                </div>

                {/* 4 Official Action Decision Buttons */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-2">
                    Scrutiny Decisions:
                  </span>

                  {/* 1. Approve */}
                  <button
                    onClick={handleApprove}
                    disabled={loading}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Approve
                  </button>

                  {/* 2. Approve with Anomalies */}
                  <button
                    onClick={() => setShowAnomalyModal(true)}
                    disabled={loading}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    title="Alerts higher-level administrators per SIH26261 oversight rules"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Approve with Anomalies
                  </button>

                  {/* 3. Reject */}
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={loading}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>

                  {/* 4. Deficiency */}
                  <button
                    onClick={() => setShowDeficiencyModal(true)}
                    disabled={loading}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Raise Deficiency
                  </button>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700 flex justify-between items-center">
                  <span>Uploaded Documents & Automated AI Scrutiny ({details.documents?.length || 0})</span>
                  <span className="text-[10px] text-slate-400">Groq LLM clause extraction active</span>
                </div>

                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {details.documents?.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">No documents uploaded yet.</div>
                  ) : (
                    details.documents.map((doc) => {
                      const finding = details.findings?.find(f => f.document_id === doc.id);
                      return (
                        <div key={doc.id} className="p-4 space-y-2 hover:bg-slate-50/50">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded font-bold text-[11px]">{doc.rule_id}</span>
                              <span className="font-semibold text-slate-800">{doc.document_name}</span>
                            </div>
                            <span className="font-bold text-[10px] px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-700">
                              {doc.validation_status}
                            </span>
                          </div>
                          {finding && <ValidationFindingCard finding={finding} />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal 1: Raise Deficiency */}
      {showDeficiencyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRaiseDeficiency} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 text-sm text-amber-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Raise Regulatory Deficiency Notice
            </h4>
            <p className="text-xs text-slate-500">
              Institution will receive a deficiency email and notification requesting document re-upload or compliance.
            </p>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Clause Reference</label>
              <input
                type="text"
                placeholder="e.g. AICTE Handbook Clause 1.1(v) - Fire Safety"
                value={deficiencyClause}
                onChange={(e) => setDeficiencyClause(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Deficiency Reason</label>
              <textarea
                rows={4}
                required
                placeholder="State the exact deficiency observed..."
                value={deficiencyReason}
                onChange={(e) => setDeficiencyReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowDeficiencyModal(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs">
                {loading ? 'Dispatching...' : 'Dispatch Deficiency Notice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 2: Approve with Anomalies (Oversight Alert to Admins) */}
      {showAnomalyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleApproveWithAnomalies} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Governance Workflow • SIH26261 Section 1.5
              </span>
              <h4 className="font-bold text-slate-800 text-sm text-slate-900 flex items-center gap-2 mt-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Record "Approved with Anomalies" Decision
              </h4>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
              <strong>Mandatory Oversight Alert:</strong> Recording this decision will automatically notify the institution <strong>AND</strong> trigger an immediate high-level escalation email to AICTE Administrators (<code className="font-mono text-amber-800">admin@aicte.gov.in</code>) with complete anomaly findings.
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Identified Anomalies / Conditional Waives (Required)
              </label>
              <textarea
                rows={3}
                required
                placeholder="Detail the specific anomalies allowed (e.g. Fire Safety certificate renewal under process; temporary municipal NOC submitted; compliance required before EVC visit)..."
                value={anomalyText}
                onChange={(e) => setAnomalyText(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Scrutiny Committee Remarks / Stipulated Deadlines
              </label>
              <textarea
                rows={2}
                placeholder="Additional instructions or conditions for the applicant institution..."
                value={anomalyRemarks}
                onChange={(e) => setAnomalyRemarks(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowAnomalyModal(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs">
                {loading ? 'Recording...' : 'Grant Conditional Approval & Alert Admins'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 3: Reject Application */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleReject} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 text-sm text-rose-600 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Record Formal Application Rejection
            </h4>
            <p className="text-xs text-slate-500">
              Institution will receive a formal rejection notice email detailing the grounds of statutory non-compliance.
            </p>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Handbook Clause Reference</label>
              <input
                type="text"
                placeholder="e.g. AICTE Approval Process Handbook Chapter I, Clause 1.4.3"
                value={rejectClause}
                onChange={(e) => setRejectClause(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Grounds / Reason for Rejection (Required)</label>
              <textarea
                rows={4}
                required
                placeholder="State the non-compliance reasons (e.g. Failure to establish clear legal land title deed, lack of sanctioned building plan)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowRejectModal(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs">
                {loading ? 'Recording...' : 'Dispatch Rejection Order'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
