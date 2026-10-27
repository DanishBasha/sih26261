import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user } = useAuth();
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <div className="p-8 text-center text-xs text-rose-600">Access Denied: Insufficient role permissions.</div>;
  }
  return children;
}
