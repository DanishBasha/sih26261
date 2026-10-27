import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <div className="relative cursor-pointer p-1.5 text-slate-600 hover:text-slate-900">
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
}
