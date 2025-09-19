import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProfile } from '../services/authService';

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
    // Check if user is authenticated by trying to get profile
    const checkAuth = async () => {
      try {
        const userData = await getProfile();
        setUser(userData);
      } catch (error) {
        // If token is invalid or missing, user will remain null
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};