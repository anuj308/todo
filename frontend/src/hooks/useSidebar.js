import { useState, useEffect, useCallback } from 'react';

const SIDEBAR_CONFIG = {
  minWidth: 200,
  maxWidth: 600,
  defaultWidth: 280,
  collapsedWidth: 60,
  storageKey: 'sidebar-config'
};

export const useSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(SIDEBAR_CONFIG.defaultWidth);
  const [isResizing, setIsResizing] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_CONFIG.storageKey);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setIsCollapsed(config.isCollapsed || false);
        setWidth(config.width || SIDEBAR_CONFIG.defaultWidth);
      } catch (error) {
        console.error('Failed to load sidebar config:', error);
      }
    }
  }, []);

  // Save state to localStorage
  const saveConfig = useCallback((newIsCollapsed, newWidth) => {
    const config = {
      isCollapsed: newIsCollapsed,
      width: newWidth
    };
    localStorage.setItem(SIDEBAR_CONFIG.storageKey, JSON.stringify(config));
  }, []);

  const toggleCollapse = useCallback(() => {
    const newIsCollapsed = !isCollapsed;
    setIsCollapsed(newIsCollapsed);
    saveConfig(newIsCollapsed, width);
  }, [isCollapsed, width, saveConfig]);

  const updateWidth = useCallback((newWidth) => {
    const clampedWidth = Math.max(
      SIDEBAR_CONFIG.minWidth,
      Math.min(SIDEBAR_CONFIG.maxWidth, newWidth)
    );
    setWidth(clampedWidth);
    saveConfig(isCollapsed, clampedWidth);
  }, [isCollapsed, saveConfig]);

  const startResize = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  const currentWidth = isCollapsed ? SIDEBAR_CONFIG.collapsedWidth : width;

  return {
    isCollapsed,
    width: currentWidth,
    isResizing,
    toggleCollapse,
    updateWidth,
    startResize,
    stopResize,
    config: SIDEBAR_CONFIG
  };
};