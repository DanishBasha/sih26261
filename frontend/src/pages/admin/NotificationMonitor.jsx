import React from 'react';

export default function NotificationMonitor() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
      <h3 className="font-bold text-sm text-slate-800">Notification Delivery Monitor</h3>
      <p className="text-xs text-slate-500 mt-1">Audit delivery rates and SMTP connection statuses across all notifications.</p>
    </div>
  );
}
