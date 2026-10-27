import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';

export default function DocumentList({ documents }) {
  if (!documents || documents.length === 0) {
    return <div className="text-xs text-slate-400 p-4">No documents submitted yet.</div>;
  }

  return (
    <div className="divide-y divide-slate-100">
      {documents.map((doc) => (
        <div key={doc.id} className="p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">{doc.document_name}</span>
            <span className="text-slate-400">({(doc.file_size / 1024).toFixed(1)} KB)</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
            {doc.validation_status}
          </span>
        </div>
      ))}
    </div>
  );
}
