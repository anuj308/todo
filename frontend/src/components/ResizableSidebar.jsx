import React, { useEffect, useRef } from 'react';
import { useSidebar } from '../hooks/useSidebar';
import './ResizableSidebar.css';

const ResizableSidebar = ({ children, className = '', type = 'default' }) => {
  const {
    isCollapsed,
    width,
    isResizing,
    toggleCollapse,
    updateWidth,
    startResize,
    stopResize,
    config
  } = useSidebar(type);

  const sidebarRef = useRef(null);
  const resizerRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Handle mouse events for resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const deltaX = e.clientX - startXRef.current;
      const newWidth = startWidthRef.current + deltaX;
      updateWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        stopResize();
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, stopResize, updateWidth]);

  const handleResizerMouseDown = (e) => {
    if (isCollapsed) return;
    
    e.preventDefault();
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    startResize();
  };

  // Handle double-click to reset width
  const handleResizerDoubleClick = () => {
    if (!isCollapsed) {
      updateWidth(config.defaultWidth);
    }
  };

  return (
    <div
      ref={sidebarRef}
      className={`resizable-sidebar ${className} ${isCollapsed ? 'collapsed' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{ 
        width: `${width}px`,
        minWidth: isCollapsed ? `${config.collapsedWidth}px` : `${config.minWidth}px`,
        maxWidth: `${config.maxWidth}px`
      }}
    >
      {/* Collapse/Expand Button */}
      <button
        className="sidebar-toggle-btn"
        onClick={toggleCollapse}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg
          className={`toggle-icon ${isCollapsed ? 'collapsed' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 3H3C1.89 3 1 3.89 1 5V19C1 20.11 1.89 21 3 21H21C22.11 21 23 20.11 23 19V5C23 3.89 22.11 3 21 3Z" />
          <path d="M10 4V20" />
          <path d="M4 7L7 10L4 13" />
        </svg>
      </button>

      {/* Sidebar Content */}
      <div className="sidebar-content">
        {isCollapsed ? (
          <div className="sidebar-collapsed-content">
            {/* Collapsed view will be handled by CSS */}
            <div className="collapsed-placeholder">
              <span className="collapsed-icon">
                {type === 'folder' ? '📁' : '📝'}
              </span>
            </div>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          ref={resizerRef}
          className="sidebar-resizer"
          onMouseDown={handleResizerMouseDown}
          onDoubleClick={handleResizerDoubleClick}
          title="Drag to resize • Double-click to reset width"
        >
          <div className="resizer-handle">
            <div className="resizer-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResizableSidebar;