import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as folderService from '../services/folderService';

const FoldersContext = createContext();

export const FoldersProvider = ({ children }) => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch all folders
  const fetchFolders = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await folderService.getFolders();
      setFolders(data);
      
      // Set first folder as selected if none selected
      if (data.length > 0 && !selectedFolder) {
        setSelectedFolder(data[0]);
      }
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new folder
  const createFolder = async (folderData) => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    try {
      const newFolder = await folderService.createFolder(folderData);
      setFolders(prev => [...prev, newFolder]);
      return newFolder;
    } catch (err) {
      console.error('Error creating folder:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update a folder
  const updateFolder = async (folderId, updates) => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    try {
      const updatedFolder = await folderService.updateFolder(folderId, updates);
      setFolders(prev => prev.map(folder => 
        (folder.id === folderId || folder._id === folderId) ? updatedFolder : folder
      ));
      
      // Update selected folder if it was updated
      if (selectedFolder && (selectedFolder.id === folderId || selectedFolder._id === folderId)) {
        setSelectedFolder(updatedFolder);
      }
      
      return updatedFolder;
    } catch (err) {
      console.error('Error updating folder:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a folder
  const deleteFolder = async (folderId) => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    try {
      await folderService.deleteFolder(folderId);
      setFolders(prev => prev.filter(folder => 
        folder.id !== folderId && folder._id !== folderId
      ));
      
      // Clear selected folder if it was deleted
      if (selectedFolder && (selectedFolder.id === folderId || selectedFolder._id === folderId)) {
        setSelectedFolder(folders[0] || null);
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting folder:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load folders when user logs in
  useEffect(() => {
    if (user) {
      fetchFolders();
    } else {
      setFolders([]);
      setSelectedFolder(null);
    }
  }, [user]);

  const value = {
    folders,
    selectedFolder,
    setSelectedFolder,
    loading,
    error,
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
  };

  return (
    <FoldersContext.Provider value={value}>
      {children}
    </FoldersContext.Provider>
  );
};

export const useFolders = () => {
  const context = useContext(FoldersContext);
  if (!context) {
    throw new Error('useFolders must be used within FoldersProvider');
  }
  return context;
};
