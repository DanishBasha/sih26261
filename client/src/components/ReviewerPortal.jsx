import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Sparkles,
  ExternalLink,
  UserCheck,
  Send,
  HelpCircle
} from 'lucide-react';

export default function ReviewerPortal() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [appDetails, setAppDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Review action modal state
  const [deficiencyModal, setDeficiencyModal] = useState(false);
  const [deficiencyReason, setDeficiencyReason] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [selectedClause, setSelectedClause] = useState('');

  const [overrideModal, setOverrideModal] = useState(false);
  const [overrideFindingId, setOverrideFindingId] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
        if (data.applications.length > 0 && !selectedApp) {
          selectApplication(data.applications[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectApplication = async (id) => {
    setSelectedApp(id);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/applications/${id}`);
      const data = await res.json();
      if (data.success) {
        setAppDetails(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Submit Deficiency
  const handleRaiseDeficiency = async () => {
    if (!deficiencyReason) return;
    try {
      const res = await fetch('/api/reviews/deficiency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: selectedApp,
          document_id: selectedDocId,
          rule_id: selectedRuleId,
          clause: selectedClause,
          reason: deficiencyReason,
          reviewer_name: 'AICTE Scrutiny Committee'
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess('Deficiency officially recorded and Gmail notice dispatched!');
        setDeficiencyModal(false);
        setDeficiencyReason('');
        selectApplication(selectedApp);
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Approval
  const handleApproveApplication = async () => {
    if (!confirm('Are you sure you want to officially APPROVE this application? An approval certificate email will be dispatched.')) return;
    try {
      const res = await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: selectedApp,
          remarks: 'All uploaded certificates and statutory affidavits comply with AICTE Approval Process Handbook norms.',
          reviewer_name: 'AICTE Scrutiny Committee'
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess('Application Approved! Formal confirmation email sent.');
        selectApplication(selectedApp);
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Override
  const handleOverrideFinding = async () => {
    if (!overrideReason) return;
    try {
      const res = await fetch('/api/reviews/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finding_id: overrideFindingId,
          override_reason: overrideReason,
          reviewer_name: 'Regional Officer / Reviewer'
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess('AI finding overridden with official audit remarks.');
        setOverrideModal(false);
        setOverrideReason('');
        selectApplication(selectedApp);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-xs font-bold uppercase opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Reviewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Applications Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              Scrutiny Queue ({applications.length})
            </h3>
            <button onClick={fetchApplications} className="text-xs text-sky-600 hover:text-sky-800 font-medium">
              Refresh
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-[650px] overflow-y-auto">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No applications in queue yet. Start one from the Institution Portal!
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => selectApplication(app.id)}
                  className={`p-4 cursor-pointer transition ${
                    selectedApp === app.id ? 'bg-sky-50/80 border-l-4 border-sky-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-slate-700">{app.application_number}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      app.status === 'Decision recorded' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'Deficiency raised' ? 'bg-rose-100 text-rose-800' :
                      app.status === 'Review required' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800 text-sm truncate">{app.institution_name}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                    <span>{app.category.slice(0, 26)}...</span>
                    <span>Docs: {app.document_count || 0}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Case Inspection & Decision Center */}
        <div className="lg:col-span-8 space-y-6">
          {loadingDetails ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              Loading scrutiny dossier...
            </div>
          ) : !appDetails ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              Select an application from the queue to start scrutiny.
            </div>
          ) : (
            <>
              {/* Dossier Header & Action Toolbar */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-800">{appDetails.application.institution_name}</h3>
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                      {appDetails.application.application_number}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Category: <span className="font-medium text-slate-700">{appDetails.application.category}</span> • 
                    Email: <span className="font-medium text-slate-700">{appDetails.application.institution_email}</span>
                  </p>
                </div>

                {/* Scrutiny Decision Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDeficiencyModal(true);
                      setSelectedDocId('');
                      setSelectedRuleId('');
                      setSelectedClause('');
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Raise Deficiency
                  </button>
                  <button
                    onClick={handleApproveApplication}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Approve Application
                  </button>
                </div>
              </div>

              {/* Uploaded Documents & AI Findings Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600" />
                    Uploaded Evidence & Automated Clause Findings ({appDetails.documents.length})
                  </h4>
                  <span className="text-xs font-semibold text-slate-500">
                    Grounded in AICTE Handbook 2024–25 to 2026–27
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
                  {appDetails.documents.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No documents uploaded for this application yet.
                    </div>
                  ) : (
                    appDetails.documents.map((doc) => {
                      const finding = appDetails.findings.find(f => f.document_id === doc.id);

                      return (
                        <div key={doc.id} className="p-5 hover:bg-slate-50/40 transition space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                                {doc.rule_id}
                              </span>
                              <span className="font-semibold text-slate-800 text-sm">
                                {doc.document_name}
                              </span>
                              <span className="text-xs text-slate-400">
                                ({(doc.file_size / 1024).toFixed(1)} KB)
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {finding?.is_overridden ? (
                                <span className="text-xs font-bold px-2.5 py-1 bg-purple-100 text-purple-800 rounded-md">
                                  Overridden by Official
                                </span>
                              ) : (
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                                  doc.validation_status === 'passed' ? 'bg-emerald-100 text-emerald-800' :
                                  doc.validation_status === 'deficiency' ? 'bg-rose-100 text-rose-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}>
                                  {doc.validation_status}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* AI Finding Card */}
                          {finding && (
                            <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                              finding.is_overridden ? 'bg-purple-50/50 border-purple-200 text-purple-900' :
                              finding.finding_type === 'passed' ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' :
                              finding.finding_type === 'deficiency' ? 'bg-rose-50/50 border-rose-200 text-rose-950' :
                              'bg-amber-50/50 border-amber-200 text-amber-950'
                            }`}>
                              <div className="flex items-center justify-between">
                                <span className="font-bold flex items-center gap-1.5 text-sm">
                                  <Sparkles className="w-4 h-4" />
                                  {finding.message}
                                </span>
                                <span className="font-mono text-[11px] opacity-75">
                                  Clause: {finding.clause_reference}
                                </span>
                              </div>
                              <p className="leading-relaxed opacity-90">{finding.explanation}</p>

                              {finding.evidence_snippet && (
                                <div className="p-2.5 bg-white/70 rounded-lg border border-slate-200/50 font-mono text-[11px] text-slate-700">
                                  <strong>Extracted Evidence:</strong> "{finding.evidence_snippet}"
                                </div>
                              )}

                              {finding.override_reason && (
                                <div className="mt-2 text-purple-800 font-semibold bg-purple-100/60 p-2 rounded">
                                  Official Override Justification: "{finding.override_reason}" (by {finding.reviewed_by})
                                </div>
                              )}

                              {/* Reviewer Override / Action Links */}
                              {!finding.is_overridden && (
                                <div className="pt-2 flex items-center justify-end gap-3 text-[11px] font-semibold">
                                  <button
                                    onClick={() => {
                                      setOverrideFindingId(finding.id);
                                      setOverrideModal(true);
                                    }}
                                    className="text-slate-600 hover:text-purple-700 underline"
                                  >
                                    Override Finding with Justification
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedDocId(doc.id);
                                      setSelectedRuleId(doc.rule_id);
                                      setSelectedClause(finding.clause_reference);
                                      setDeficiencyReason(finding.explanation);
                                      setDeficiencyModal(true);
                                    }}
                                    className="text-rose-600 hover:text-rose-800 underline"
                                  >
                                    Send Deficiency Notice
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
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

      {/* Raise Deficiency Modal */}
      {deficiencyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              Raise Regulatory Deficiency Notice
            </h3>
            <p className="text-xs text-slate-500">
              This action will update the application status to <strong>Deficiency Raised</strong> and trigger an automatic email alert to the applicant.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clause Reference</label>
              <input
                type="text"
                placeholder="e.g. AICTE Handbook Clause 1.1(v) - Fire Safety"
                value={selectedClause}
                onChange={(e) => setSelectedClause(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deficiency Reason & Required Rectification</label>
              <textarea
                rows={4}
                placeholder="Explain the specific deficiency observed in the document..."
                value={deficiencyReason}
                onChange={(e) => setDeficiencyReason(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeficiencyModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRaiseDeficiency}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                Record Deficiency & Dispatch Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Override Finding Modal */}
      {overrideModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 text-purple-700">
              <HelpCircle className="w-5 h-5" />
              Override Automated AI Finding
            </h3>
            <p className="text-xs text-slate-500">
              As per project guidelines, AI provides decision-support only. Authorized officials may override findings by providing a statutory reason for the permanent audit trail.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Override Justification (Required)</label>
              <textarea
                rows={4}
                placeholder="State the official justification (e.g. 'Verified physical original certificate in regional council office')..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOverrideModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideFinding}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                Confirm & Log Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
