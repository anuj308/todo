import React, { useState } from 'react';
import { useFolders } from '../context/FoldersContext';
import { useNotes } from '../context/NotesContext';
import ResizableSidebar from './ResizableSidebar';
import './FolderSidebar.css';

function FolderSidebar() {
  const { 
    folders, 
    selectedFolder, 
    setSelectedFolder, 
    createFolder, 
    updateFolder, 
    deleteFolder,
    loading: foldersLoading 
  } = useFolders();
  
  const { addNote } = useNotes();
  
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3b82f6');
  const [newFolderIcon, setNewFolderIcon] = useState('📁');

  const predefinedColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  const predefinedIcons = [
    '📁', '📝', '💼', '🏠', '📚', '💡', '🎯', '📊',
    '🔍', '⭐', '🎨', '💻', '📱', '🌟', '🔥', '🚀'
  ];

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const success = await createFolder({
      name: newFolderName.trim(),
      color: newFolderColor,
      icon: newFolderIcon
    });

    if (success) {
      setNewFolderName('');
      setNewFolderColor('#3b82f6');
      setNewFolderIcon('📁');
      setShowNewFolderForm(false);
    }
  };

  const handleUpdateFolder = async (e) => {
    e.preventDefault();
    if (!editingFolder || !newFolderName.trim()) return;

    const success = await updateFolder(editingFolder.id, {
      name: newFolderName.trim(),
      color: newFolderColor,
      icon: newFolderIcon
    });

    if (success) {
      setEditingFolder(null);
      setNewFolderName('');
      setNewFolderColor('#3b82f6');
      setNewFolderIcon('📁');
    }
  };

  const handleDeleteFolder = async (folder) => {
    if (folder.isDefault) {
      alert('Cannot delete the default folder');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${folder.name}"? All notes in this folder will be moved to the default folder.`
    );

    if (confirmDelete) {
      const defaultFolder = folders.find(f => f.isDefault);
      await deleteFolder(folder.id, defaultFolder?.id);
    }
  };

  const handleFolderSelect = (folder) => {
    setSelectedFolder(folder);
  };

  const handleAddNote = async (folder) => {
    const title = prompt('Enter note title:');
    if (title) {
      await addNote(title, folder.id);
    }
  };

  const startEditingFolder = (folder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setNewFolderColor(folder.color);
    setNewFolderIcon(folder.icon);
    setShowNewFolderForm(false);
  };

  const cancelEditing = () => {
    setEditingFolder(null);
    setShowNewFolderForm(false);
    setNewFolderName('');
    setNewFolderColor('#3b82f6');
    setNewFolderIcon('📁');
  };

  if (foldersLoading) {
    return (
      <ResizableSidebar className="folder-sidebar">
        <div className="sidebar-header">
          <h3>Folders</h3>
        </div>
        <div className="sidebar-loading">Loading folders...</div>
      </ResizableSidebar>
    );
  }

  return (
    <ResizableSidebar className="folder-sidebar">
      <div className="sidebar-header">
        <h3>Folders</h3>
        <button 
          className="add-folder-btn"
          onClick={() => setShowNewFolderForm(true)}
          disabled={showNewFolderForm || editingFolder}
        >
          +
        </button>
      </div>

      {/* New Folder Form */}
      {showNewFolderForm && (
        <form onSubmit={handleCreateFolder} className="folder-form">
          <div className="form-row">
            <select 
              value={newFolderIcon} 
              onChange={(e) => setNewFolderIcon(e.target.value)}
              className="icon-select"
            >
              {predefinedIcons.map(icon => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="folder-name-input"
              autoFocus
              maxLength={50}
            />
          </div>
          <div className="color-picker">
            {predefinedColors.map(color => (
              <button
                key={color}
                type="button"
                className={`color-option ${newFolderColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setNewFolderColor(color)}
              />
            ))}
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" onClick={cancelEditing} className="cancel-btn">Cancel</button>
          </div>
        </form>
      )}

      {/* Edit Folder Form */}
      {editingFolder && (
        <form onSubmit={handleUpdateFolder} className="folder-form">
          <div className="form-row">
            <select 
              value={newFolderIcon} 
              onChange={(e) => setNewFolderIcon(e.target.value)}
              className="icon-select"
            >
              {predefinedIcons.map(icon => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="folder-name-input"
              autoFocus
              maxLength={50}
            />
          </div>
          <div className="color-picker">
            {predefinedColors.map(color => (
              <button
                key={color}
                type="button"
                className={`color-option ${newFolderColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setNewFolderColor(color)}
              />
            ))}
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">Update</button>
            <button type="button" onClick={cancelEditing} className="cancel-btn">Cancel</button>
          </div>
        </form>
      )}

      {/* Folders List */}
      <div className="folders-list">
        {folders.map(folder => (
          <div 
            key={folder.id} 
            className={`folder-item ${selectedFolder?.id === folder.id ? 'selected' : ''}`}
            onClick={() => handleFolderSelect(folder)}
          >
            <div className="folder-content">
              <span className="folder-icon">{folder.icon}</span>
              <span className="folder-name">{folder.name}</span>
              <span className="notes-count">{folder.notesCount || 0}</span>
            </div>
            <div 
              className="folder-color-indicator" 
              style={{ backgroundColor: folder.color }}
            />
            <div className="folder-actions">
              <button
                className="action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddNote(folder);
                }}
                title="Add note"
              >
                📝
              </button>
              {!folder.isDefault && (
                <>
                  <button
                    className="action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingFolder(folder);
                    }}
                    title="Edit folder"
                  >
                    ✏️
                  </button>
                  <button
                    className="action-btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder);
                    }}
                    title="Delete folder"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {folders.length === 0 && (
        <div className="empty-state">
          <p>No folders yet</p>
          <button 
            className="create-first-folder-btn"
            onClick={() => setShowNewFolderForm(true)}
          >
            Create your first folder
          </button>
        </div>
      )}
    </ResizableSidebar>
  );
}

export default FolderSidebar;