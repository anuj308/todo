import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import * as diaryService from '../services/diaryService';

const DiaryContext = createContext();

const normalizeDate = (input) => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DiaryProvider = ({ children }) => {
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setEntries({});
      return;
    }

    loadEntry(selectedDate).catch(() => {
      // errors handled inside loadEntry
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedDate]);

  const loadEntry = async (dateValue) => {
    if (!user) return null;

    const normalized = normalizeDate(dateValue || selectedDate);
    const key = formatKey(normalized);

    setEntries((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        loading: true,
      },
    }));
    setError(null);
    setLoading(true);

    try {
      const entry = await diaryService.getDiaryEntry(normalized);
      const parsedDate = entry?.date ? new Date(entry.date) : normalized;

      setEntries((prev) => ({
        ...prev,
        [key]: {
          id: entry?.id || entry?._id || null,
          content: entry?.content || '',
          date: parsedDate,
          loading: false,
          updatedAt: entry?.updatedAt ? new Date(entry.updatedAt) : null,
        },
      }));

      return entry;
    } catch (err) {
      setError(err.message);
      setEntries((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] || {}),
          loading: false,
          error: err.message,
        },
      }));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async (dateValue, content) => {
    if (!user) return null;

    const normalized = normalizeDate(dateValue || selectedDate);
    const key = formatKey(normalized);

    setSaving(true);
    setError(null);

    try {
      const saved = await diaryService.saveDiaryEntry(normalized, content);
      const parsedDate = saved?.date ? new Date(saved.date) : normalized;

      setEntries((prev) => ({
        ...prev,
        [key]: {
          id: saved?.id || saved?._id || null,
          content: saved?.content || '',
          date: parsedDate,
          loading: false,
          updatedAt: saved?.updatedAt ? new Date(saved.updatedAt) : new Date(),
        },
      }));

      return saved;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const selectDate = (dateValue) => {
    try {
      const normalized = normalizeDate(dateValue);
      setSelectedDate(normalized);
    } catch (err) {
      setError(err.message);
    }
  };

  const getEntryForDate = (dateValue) => {
    const key = formatKey(dateValue);
    return entries[key] || { content: '', loading: false };
  };

  const recentEntries = useMemo(() => {
    const items = Object.values(entries)
      .filter((entry) => entry?.content)
      .sort((a, b) => {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        return timeB - timeA;
      });
    return items.slice(0, 7);
  }, [entries]);

  const value = {
    selectedDate,
    selectDate,
    loadEntry,
    saveEntry,
    getEntryForDate,
    recentEntries,
    loading,
    saving,
    error,
  };

  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
};

export const useDiary = () => {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error('useDiary must be used within DiaryProvider');
  }
  return context;
};
