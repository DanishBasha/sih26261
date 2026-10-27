import { useState, useEffect } from 'react';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotifications(data.notifications);
          setUnreadCount(data.notifications.length);
        }
      })
      .catch(console.error);
  }, []);

  return { notifications, unreadCount };
}
