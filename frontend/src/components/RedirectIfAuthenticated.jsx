// filepath: c:\Users\DELL\Desktop\create\src\components\RedirectIfAuthenticated.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RedirectIfAuthenticated = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/todo" replace />;
  }

  return children;
};

export default RedirectIfAuthenticated;