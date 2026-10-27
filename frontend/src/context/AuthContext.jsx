import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    try {
      const stored = localStorage.getItem('sih_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [portalType, setPortalType] = useState('institution'); // 'institution' | 'official' | 'admin'

  const loginUser = (userData) => {
    if (!userData) {
      setUserState(null);
      localStorage.removeItem('sih_user');
      return;
    }
    // Normalize role so 'institution_user' is also accessed as 'institution'
    const normalizedRole = userData.role === 'institution_user' ? 'institution' : userData.role;
    const finalUser = {
      ...userData,
      role: normalizedRole,
      raw_role: userData.role
    };
    setUserState(finalUser);
    localStorage.setItem('sih_user', JSON.stringify(finalUser));
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem('sih_user');
  };

  const updateUser = (patch) => {
    setUserState(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...patch };
      localStorage.setItem('sih_user', JSON.stringify(updated));
      return updated;
    });
  };

  const switchRole = (newRole) => {
    setUserState(prev => {
      const updated = {
        ...(prev || { id: 'demo-user-1', email: 'evaluator@aicte.gov.in', full_name: 'Evaluator' }),
        role: newRole,
        raw_role: newRole === 'institution' ? 'institution_user' : newRole
      };
      localStorage.setItem('sih_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser: loginUser,
      loginUser,
      logout,
      updateUser,
      switchRole,
      portalType,
      setPortalType,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
