import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileCheck, 
  UploadCloud, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Sparkles,
  ShieldAlert,
  Send,
  RefreshCw,
  FileText
} from 'lucide-react';

export default function InstitutionPortal() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [institutionEmail, setInstitutionEmail] = useState('');
  const [activeApplication, setActiveApplication] = useState(null);
  
  const [checklist, setChecklist] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [findings, setFindings] = useState([]);
  const [uploadingRuleId, setUploadingRuleId] = useState(null);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState(null);

  // Load distinct categories
  useEffect(() => {
    fetch('/api/rules/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories.length > 0) {
          setCategories(data.categories);
          // Default to New Technical Institution
          const def = data.categories.find(c => c.includes('New Technical')) || data.categories[0];
          setSelectedCategory(def);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch dynamic checklist when category changes
  useEffect(() => {
    if (!selectedCategory) return;
    setLoadingChecklist(true);
    fetch(`/api/rules/checklist/${encodeURIComponent(selectedCategory)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setChecklist(data.checklist);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingChecklist(false));
  }, [selectedCategory]);

  // Create Application
  const handleStartApplication = async (e) => {
    e.preventDefault();
    if (!institutionName || !institutionEmail || !selectedCategory) return;

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institution_name: institutionName,
          institution_email: institutionEmail,
          category: selectedCategory
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveApplication(data.application);
        setNotificationMsg({
          type: 'success',
          text: `Application #${data.application.application_number} started! Confirmation email sent to ${institutionEmail}.`
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Upload Document and trigger AI compliance check
  const handleFileUpload = async (ruleId, docName, file) => {
    if (!activeApplication) {
      alert('Please start or select an application first!');
      return;
    }
    setUploadingRuleId(ruleId);

    const formData = new FormData();
    formData.append('application_id', activeApplication.id);
    formData.append('rule_id', ruleId);
    formData.append('document_name', docName);
    formData.append('file', file);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setUploadedDocs(prev => [data.document, ...prev.filter(d => d.rule_id !== ruleId)]);
        setFindings(prev => [data.finding, ...prev.filter(f => f.rule_id !== ruleId)]);
        setNotificationMsg({
          type: 'success',
          text: `AI Scrutiny complete for "${docName}". Status: ${data.finding.finding_type.toUpperCase()}`
        });
      }
    } catch (err) {
      console.error(err);
      setNotificationMsg({ type: 'error', text: 'Upload failed: ' + err.message });
    } finally {
      setUploadingRuleId(null);
    }
  };

  // Submit Application for Scrutiny
  const handleSubmitApplication = async () => {
    if (!activeApplication) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${activeApplication.id}/submit`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (data.success) {
        setActiveApplication(data.application);
        setNotificationMsg({
          type: 'success',
          text: `Application submitted for official review! Official acknowledgement email dispatched.`
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Notification Toast */}
      {notificationMsg && (
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm transition ${
          notificationMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {notificationMsg.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
            <span className="text-sm font-medium">{notificationMsg.text}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-xs font-bold uppercase opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Initiation Card */}
      {!activeApplication ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-sky-100 text-sky-700 rounded-xl mb-2">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">New AICTE Regulatory Filing</h2>
            <p className="text-sm text-slate-500">
              Select your application category to generate a customized regulatory compliance checklist.
            </p>
          </div>

          <form onSubmit={handleStartApplication} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Application Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              >
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Institution Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. National Institute of Technology"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Authorized Contact Email
                </label>
                <input
                  type="email"
                  placeholder="principal@college.edu"
                  value={institutionEmail}
                  onChange={(e) => setInstitutionEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              Generate AICTE Checklist & Start Filing
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Active Application Dashboard */
        <div className="space-y-6">
          {/* Status Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-800">{activeApplication.institution_name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  activeApplication.status === 'Decision recorded' ? 'bg-emerald-100 text-emerald-800' :
                  activeApplication.status === 'Deficiency raised' ? 'bg-rose-100 text-rose-800' :
                  activeApplication.status === 'Review required' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {activeApplication.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                App ID: <span className="font-mono font-semibold text-slate-700">{activeApplication.application_number}</span> • 
                Category: <span className="font-medium text-slate-700">{activeApplication.category}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmitApplication}
                disabled={submitting || activeApplication.status === 'Review required'}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {activeApplication.status === 'Review required' ? 'Application Under Scrutiny' : 'Submit for Review'}
              </button>
            </div>
          </div>

          {/* Checklist & Document Upload Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-sky-600" />
                  Dynamic Regulatory Checklist ({checklist.length} Mandatory Requirements)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Extracted directly from AICTE Handbook 2024–25 to 2026–27. Upload each document to trigger real-time AI compliance audit.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-lg">
                Uploaded: {uploadedDocs.length} / {checklist.length}
              </span>
            </div>

            {loadingChecklist ? (
              <div className="p-12 text-center text-slate-400">Loading checklist rules...</div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {checklist.map((rule) => {
                  const uploaded = uploadedDocs.find(d => d.rule_id === rule.rule_id);
                  const finding = findings.find(f => f.rule_id === rule.rule_id);
                  const isUploading = uploadingRuleId === rule.rule_id;

                  return (
                    <div key={rule.rule_id} className="p-5 hover:bg-slate-50/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Rule details */}
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                            {rule.rule_id}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            {rule.annexure} • Clause {rule.source_clause} {rule.printed_page && `(p. ${rule.printed_page})`}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 leading-snug">
                          {rule.requirement_text}
                        </p>
                        <p className="text-xs text-slate-400">
                          {rule.applicability_condition}
                        </p>

                        {/* AI Finding Insight */}
                        {finding && (
                          <div className={`mt-2 p-3 rounded-lg text-xs border ${
                            finding.finding_type === 'passed' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' :
                            finding.finding_type === 'deficiency' ? 'bg-rose-50/70 border-rose-200 text-rose-900' :
                            'bg-amber-50/70 border-amber-200 text-amber-900'
                          }`}>
                            <div className="font-semibold flex items-center gap-1.5 mb-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              AI Compliance Finding: {finding.message}
                            </div>
                            <p className="opacity-90">{finding.explanation}</p>
                            {finding.evidence_snippet && (
                              <p className="mt-1 font-mono text-[11px] opacity-75">
                                Evidence: "{finding.evidence_snippet.slice(0, 120)}..."
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Upload Button & Status */}
                      <div className="flex items-center gap-3 shrink-0">
                        {uploaded ? (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Uploaded ({uploaded.document_name.slice(0, 15)})
                            </span>
                            <label className="text-xs text-sky-600 hover:text-sky-800 font-medium cursor-pointer underline">
                              Replace
                              <input
                                type="file"
                                accept=".pdf,image/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(rule.rule_id, e.target.files[0].name, e.target.files[0])}
                              />
                            </label>
                          </div>
                        ) : (
                          <label className={`px-4 py-2 border border-slate-200 hover:border-sky-500 rounded-xl text-xs font-semibold text-slate-700 hover:text-sky-600 cursor-pointer transition flex items-center gap-2 bg-white shadow-sm ${
                            isUploading ? 'opacity-50 pointer-events-none' : ''
                          }`}>
                            {isUploading ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
                                Auditing via AI...
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-4 h-4 text-slate-400" />
                                Upload Document
                              </>
                            )}
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              disabled={isUploading}
                              className="hidden"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(rule.rule_id, e.target.files[0].name, e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
