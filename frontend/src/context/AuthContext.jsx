import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: 'inst-user-1',
    name: 'Dr. Principal',
    email: 'danishbasha18@gmail.com',
    role: 'institution' // 'institution' | 'official' | 'admin'
  });

  const switchRole = (newRole) => {
    setUser(prev => ({ ...prev, role: newRole }));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
