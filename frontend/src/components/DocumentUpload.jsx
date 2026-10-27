import React, { useState } from 'react';
import { UploadCloud, RefreshCw } from 'lucide-react';

export default function DocumentUpload({ ruleId, docName, onUpload, isUploading }) {
  return (
    <label className={`px-4 py-2 border border-slate-200 hover:border-sky-500 rounded-xl text-xs font-semibold text-slate-700 hover:text-sky-600 cursor-pointer transition flex items-center gap-2 bg-white shadow-xs ${
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
        onChange={(e) => e.target.files?.[0] && onUpload(ruleId, docName, e.target.files[0])}
      />
    </label>
  );
}
