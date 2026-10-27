import React from 'react';

export default function Forbidden() {
  return (
    <div className="p-12 text-center text-rose-600">
      <h3 className="text-xl font-bold">403 - Forbidden</h3>
      <p className="text-xs text-slate-500 mt-1">You do not have authorization to view this regulatory docket.</p>
    </div>
  );
}
