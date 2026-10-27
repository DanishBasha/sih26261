import React, { useState, useEffect } from 'react';
import { Bell, Mail } from 'lucide-react';
import { notificationsApi } from '../../services/notifications.api';
import { formatDate } from '../../utils/formatDate';

export default function Notifications() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    notificationsApi.list()
      .then(res => setLogs(res.notifications || []))
      .catch(console.error);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-800 flex items-center gap-2">
        <Bell className="w-4 h-4 text-sky-600" />
        Notification Logs & Email Dispatches ({logs.length})
      </div>
      <div className="divide-y divide-slate-100">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No notifications dispatched yet.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-800">{log.subject}</div>
                <div className="text-slate-400 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  To: {log.recipient_email}
                </div>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">{formatDate(log.sent_at)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
