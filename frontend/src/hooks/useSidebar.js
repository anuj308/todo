import { useState, useEffect, useCallback } from 'react';

const SIDEBAR_CONFIGS = {
  folder: {
    minWidth: 150, // Reduced from 200
    maxWidth: 400,
    defaultWidth: 250, // Reduced from 280
    collapsedWidth: 50, // Reduced from 60
    storageKey: 'folder-sidebar-config'
  },
  notes: {
    minWidth: 200, // Reduced from 250
    maxWidth: 500,
    defaultWidth: 280, // Reduced from 320
    collapsedWidth: 50, // Reduced from 60
    storageKey: 'notes-sidebar-config'
  },
  default: {
    minWidth: 180, // Reduced from 200
    maxWidth: 600,
    defaultWidth: 260, // Reduced from 280
    collapsedWidth: 50, // Reduced from 60
    storageKey: 'sidebar-config'
  }
};

export const useSidebar = (type = 'default') => {
  const config = SIDEBAR_CONFIGS[type] || SIDEBAR_CONFIGS.default;
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(config.defaultWidth);
  const [isResizing, setIsResizing] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(config.storageKey);
    if (saved) {
      try {
        const savedConfig = JSON.parse(saved);
        setIsCollapsed(savedConfig.isCollapsed || false);
        setWidth(savedConfig.width || config.defaultWidth);
      } catch (error) {
        console.error('Failed to load sidebar config:', error);
      }
    }
  }, [config.storageKey, config.defaultWidth]);

  // Save state to localStorage
  const saveConfig = useCallback((newIsCollapsed, newWidth) => {
    const sidebarConfig = {
      isCollapsed: newIsCollapsed,
      width: newWidth
    };
    localStorage.setItem(config.storageKey, JSON.stringify(sidebarConfig));
  }, [config.storageKey]);

  const toggleCollapse = useCallback(() => {
    const newIsCollapsed = !isCollapsed;
    setIsCollapsed(newIsCollapsed);
    saveConfig(newIsCollapsed, width);
  }, [isCollapsed, width, saveConfig]);

  const updateWidth = useCallback((newWidth) => {
    const clampedWidth = Math.max(
      config.minWidth,
      Math.min(config.maxWidth, newWidth)
    );
    setWidth(clampedWidth);
    saveConfig(isCollapsed, clampedWidth);
  }, [config.minWidth, config.maxWidth, isCollapsed, saveConfig]);

  const startResize = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  const currentWidth = isCollapsed ? config.collapsedWidth : width;

  return {
    isCollapsed,
    width: currentWidth,
    isResizing,
    toggleCollapse,
    updateWidth,
    startResize,
    stopResize,
    config
  };
};