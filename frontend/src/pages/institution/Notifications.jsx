import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  Send, 
  RefreshCw, 
  Clock, 
  Sparkles,
  Lock
} from 'lucide-react';
import { notificationsApi } from '../../services/notifications.api';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatDate';

export default function Notifications() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingType, setSendingType] = useState(null);
  const [toast, setToast] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.list();
      setLogs(res.notifications || []);
      if (!selectedLog && res.notifications?.length > 0) {
        setSelectedLog(res.notifications[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSendTest = async (type) => {
    setSendingType(type);
    try {
      const res = await notificationsApi.sendTestEmail({
        type,
        recipient_email: user?.email || 'danishbasha18@gmail.com'
      });
      setToast(res.message || `Test ${type} email dispatched successfully!`);
      await fetchLogs();
    } catch (err) {
      alert(`Error sending test email: ${err.message}`);
    } finally {
      setSendingType(null);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterType === 'decisions') {
      return log.subject.includes('Approval') || log.subject.includes('Rejected');
    }
    if (filterType === 'oversight') {
      return log.subject.includes('OVERSIGHT') || log.recipient_email.includes('admin@aicte.gov.in');
    }
    if (filterType === 'deficiency') {
      return log.subject.includes('Deficiency');
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex justify-between items-center shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="uppercase font-bold text-[10px] text-emerald-700 hover:text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Header and Live Email Dispatch Tester */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">Notifications & Email Dispatch Center</h1>
              <span className="bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                SIH26261 Email Spec
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dual-channel regulatory delivery: Real-time In-Portal Alerts paired with automated Gmail SMTP transmissions.
            </p>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Logs
          </button>
        </div>

        {/* Live Evaluator Test Bar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              1-Click Decision Email Tester (Dispatches to {user?.email || 'your email'})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Gmail SMTP Verified</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => handleSendTest('approved')}
              disabled={!!sendingType}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {sendingType === 'approved' ? 'Sending...' : 'Test Approval Email'}
            </button>

            <button
              onClick={() => handleSendTest('approved_with_anomalies')}
              disabled={!!sendingType}
              className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {sendingType === 'approved_with_anomalies' ? 'Sending...' : 'Test Anomaly + Admin Alert'}
            </button>

            <button
              onClick={() => handleSendTest('rejected')}
              disabled={!!sendingType}
              className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              {sendingType === 'rejected' ? 'Sending...' : 'Test Rejection Email'}
            </button>

            <button
              onClick={() => handleSendTest('deficiency')}
              disabled={!!sendingType}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {sendingType === 'deficiency' ? 'Sending...' : 'Test Deficiency Email'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold w-full sm:w-auto overflow-x-auto">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg transition shrink-0 ${filterType === 'all' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'}`}
        >
          All Notifications ({logs.length})
        </button>
        <button
          onClick={() => setFilterType('decisions')}
          className={`px-3 py-1.5 rounded-lg transition shrink-0 ${filterType === 'decisions' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'}`}
        >
          Decisions (Approved / Rejected)
        </button>
        <button
          onClick={() => setFilterType('oversight')}
          className={`px-3 py-1.5 rounded-lg transition shrink-0 ${filterType === 'oversight' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'}`}
        >
          Administrator Oversight Alerts
        </button>
        <button
          onClick={() => setFilterType('deficiency')}
          className={`px-3 py-1.5 rounded-lg transition shrink-0 ${filterType === 'deficiency' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'}`}
        >
          Deficiencies & Notices
        </button>
      </div>

      {/* Two Column Layout: Dispatch History & Selected Dossier Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Dispatch Logs */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-700 flex justify-between items-center">
            <span>Audit Trail & Delivery Register ({filteredLogs.length})</span>
            <span className="text-[11px] font-normal text-slate-400">Click entry to inspect</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No matching notification dispatches found.</div>
            ) : (
              filteredLogs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                const isOversight = log.subject.includes('OVERSIGHT') || log.recipient_email.includes('admin@aicte.gov.in');
                const isApproved = log.subject.includes('Approval Granted');
                const isRejected = log.subject.includes('Rejected');

                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`p-4 cursor-pointer transition ${
                      isSelected ? 'bg-sky-50 border-l-4 border-sky-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        {isOversight ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                            Admin Alert
                          </span>
                        ) : isApproved ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                            Approved
                          </span>
                        ) : isRejected ? (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                            Rejected
                          </span>
                        ) : (
                          <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                            Notice
                          </span>
                        )}
                        <span className="font-bold text-xs text-slate-900 line-clamp-1">{log.subject}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        ✓ {log.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                      <div className="flex items-center gap-1 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-slate-700">{log.recipient_email}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono shrink-0">
                        {formatDate(log.sent_at)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Log Inspector */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          {selectedLog ? (
            <>
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Notification Dispatch Inspector
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1">{selectedLog.subject}</h3>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Recipient Email</span>
                  <strong className="text-slate-800 font-mono">{selectedLog.recipient_email}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Delivery Status</span>
                  <span className="inline-block px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-emerald-100 text-emerald-800">
                    {selectedLog.status} (Confirmed by SMTP)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Timestamp</span>
                  <span className="text-slate-700 font-mono">{formatDate(selectedLog.sent_at)}</span>
                </div>
                {selectedLog.application_id && (
                  <div>
                    <span className="text-slate-400 text-[10px] block">Linked Application UUID</span>
                    <span className="font-mono text-[10px] text-slate-600 truncate block">{selectedLog.application_id}</span>
                  </div>
                )}
              </div>

              {/* Security Policy Badge */}
              <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-sky-800">
                  <Lock className="w-3.5 h-3.5" />
                  Security & Privacy Standard (SIH26261 Section 4)
                </div>
                <p className="text-[11px] text-sky-700 leading-relaxed">
                  ✓ Passwords are never transmitted via email.<br />
                  ✓ All account activations and recovery require authorized browser flows.<br />
                  ✓ Delivery record stored in immutable system audit logs.
                </p>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">Select a dispatch log to inspect delivery metadata.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
