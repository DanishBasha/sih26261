import React, { useState, useEffect } from 'react';
import { FileCheck, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { applicationsApi } from '../../services/applications.api';
import { rulesApi } from '../../services/rules.api';
import { documentsApi } from '../../services/documents.api';
import StatusBadge from '../../components/StatusBadge';
import DocumentUpload from '../../components/DocumentUpload';
import ValidationFindingCard from '../../components/ValidationFindingCard';

export default function ApplicationDetails({ applicationId, onBack }) {
  const [appData, setAppData] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [uploadingRule, setUploadingRule] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [applicationId]);

  const loadDetails = async () => {
    const data = await applicationsApi.getById(applicationId);
    setAppData(data);
    const check = await rulesApi.getChecklist(data.application.category);
    setChecklist(check.checklist || []);
  };

  const handleUpload = async (ruleId, docName, file) => {
    setUploadingRule(ruleId);
    const formData = new FormData();
    formData.append('application_id', applicationId);
    formData.append('rule_id', ruleId);
    formData.append('document_name', docName);
    formData.append('file', file);

    try {
      await documentsApi.upload(formData);
      await loadDetails();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingRule(null);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await applicationsApi.submit(applicationId);
      await loadDetails();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!appData) return <div className="p-8 text-center text-xs text-slate-400">Loading details...</div>;

  const { application, documents = [], findings = [] } = appData;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <button onClick={onBack} className="text-xs text-sky-600 font-semibold mb-2 block">← Back to Dashboard</button>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">{application.institution_name}</h2>
            <StatusBadge status={application.status} />
          </div>
          <p className="text-xs text-slate-500 mt-1">App #{application.application_number} • {application.category}</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || application.status === 'Review required'}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition"
        >
          <Send className="w-4 h-4" />
          {application.status === 'Review required' ? 'Under Scrutiny' : 'Submit Application'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-sky-600" />
            Mandatory Documents Checklist ({checklist.length} Requirements)
          </h3>
          <span className="text-xs text-slate-500 font-medium">Uploaded: {documents.length} / {checklist.length}</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {checklist.map((rule) => {
            const uploaded = documents.find(d => d.rule_id === rule.rule_id);
            const finding = findings.find(f => f.rule_id === rule.rule_id);

            return (
              <div key={rule.rule_id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                      {rule.rule_id}
                    </span>
                    <span className="text-[11px] text-slate-400">Clause {rule.source_clause}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">{rule.requirement_text}</div>
                  <div className="text-[11px] text-slate-400">{rule.applicability_condition}</div>
                  {finding && <ValidationFindingCard finding={finding} />}
                </div>

                <div>
                  {uploaded ? (
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Uploaded
                    </span>
                  ) : (
                    <DocumentUpload
                      ruleId={rule.rule_id}
                      docName={rule.requirement_text.slice(0, 30)}
                      onUpload={handleUpload}
                      isUploading={uploadingRule === rule.rule_id}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
