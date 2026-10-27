import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, UserCheck, Sparkles, FileText } from 'lucide-react';
import { applicationsApi } from '../../services/applications.api';
import { reviewsApi } from '../../services/reviews.api';
import StatusBadge from '../../components/StatusBadge';
import ValidationFindingCard from '../../components/ValidationFindingCard';

export default function ReviewApplication() {
  const [apps, setApps] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [deficiencyReason, setDeficiencyReason] = useState('');
  const [clause, setClause] = useState('');
  const [showDeficiencyModal, setShowDeficiencyModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    const res = await applicationsApi.list();
    setApps(res.applications || []);
    if (res.applications?.length && !selectedId) {
      loadAppDetails(res.applications[0].id);
    }
  };

  const loadAppDetails = async (id) => {
    setSelectedId(id);
    const data = await applicationsApi.getById(id);
    setDetails(data);
  };

  const handleRaiseDeficiency = async () => {
    if (!deficiencyReason) return;
    await reviewsApi.raiseDeficiency({
      application_id: selectedId,
      reason: deficiencyReason,
      clause: clause || 'AICTE Norms'
    });
    setToast('Deficiency recorded & formal notice email sent to institution!');
    setShowDeficiencyModal(false);
    setDeficiencyReason('');
    loadAppDetails(selectedId);
    loadQueue();
  };

  const handleApprove = async () => {
    if (!confirm('Approve this application? Formal certificate email will be dispatched.')) return;
    await reviewsApi.approve({
      application_id: selectedId,
      remarks: 'All documents comply with AICTE Approval Process Handbook requirements.'
    });
    setToast('Application officially Approved & congratulatory email sent!');
    loadAppDetails(selectedId);
    loadQueue();
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex justify-between items-center shadow-xs">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="uppercase font-bold text-[10px]">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Scrutiny Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-700 flex justify-between items-center">
            <span>Scrutiny Dossier Queue ({apps.length})</span>
            <button onClick={loadQueue} className="text-sky-600 font-semibold">Refresh</button>
          </div>
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
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
                <div className="text-[11px] text-slate-400 mt-1">{app.category.slice(0, 30)}...</div>
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
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-800">{details.application.institution_name}</h3>
                    <StatusBadge status={details.application.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">#{details.application.application_number} • {details.application.category}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeficiencyModal(true)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Raise Deficiency
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Approve Application
                  </button>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700">
                  Uploaded Documents & Automated AI Findings ({details.documents?.length || 0})
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

      {showDeficiencyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 text-sm text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Raise Regulatory Deficiency Notice
            </h4>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Clause Reference</label>
              <input
                type="text"
                placeholder="e.g. AICTE Handbook Clause 1.1(v) - Fire Safety"
                value={clause}
                onChange={(e) => setClause(e.target.value)}
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
              <button onClick={() => setShowDeficiencyModal(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
              <button onClick={handleRaiseDeficiency} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-xs">
                Dispatch Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
