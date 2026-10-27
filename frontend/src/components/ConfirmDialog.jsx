import React from 'react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
        <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
        <p className="text-xs text-slate-500">{message}</p>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-3 py-1.5 text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 rounded-lg shadow-xs">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
