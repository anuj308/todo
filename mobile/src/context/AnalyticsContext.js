import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as analyticsService from '../services/analyticsService';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getProductivityMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchTimeLogs = useCallback(async (filters) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getTimeLogs(filters);
      setTimeLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMetrics();
      fetchTimeLogs(); // Initial fetch with no filters
    } else {
      setMetrics(null);
      setTimeLogs([]);
    }
  }, [user, fetchMetrics, fetchTimeLogs]);

  const value = {
    metrics,
    timeLogs,
    loading,
    error,
    fetchMetrics,
    fetchTimeLogs,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
