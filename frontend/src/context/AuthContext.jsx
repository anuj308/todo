import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser } from '../services/authService';

// Create context
const AuthContext = createContext(null);

// Custom hook for using the auth context
export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const user = getCurrentUser();
    if (user) {
      setUser(user);
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};