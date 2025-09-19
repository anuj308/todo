import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FoldersContext = createContext();

const getBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || '/api';
};

export function FoldersProvider({ children }) {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const API_URL = getBaseUrl();

  // Fetch all folders
  const fetchFolders = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/folders`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch folders: ${response.status}`);
      }
      
      const data = await response.json();
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
      const response = await fetch(`${API_URL}/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(folderData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create folder');
      }
      
      const newFolder = await response.json();
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
      const response = await fetch(`${API_URL}/folders/${folderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update folder');
      }
      
      const updatedFolder = await response.json();
      
      setFolders(prev => 
        prev.map(folder => folder.id === folderId ? updatedFolder : folder)
      );
      
      // Update selected folder if it's the one being updated
      if (selectedFolder && selectedFolder.id === folderId) {
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
  const deleteFolder = async (folderId, moveNotesToFolderId = null) => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/folders/${folderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ moveNotesToFolderId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete folder');
      }
      
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      
      // If deleted folder was selected, select first remaining folder
      if (selectedFolder && selectedFolder.id === folderId) {
        const remainingFolders = folders.filter(f => f.id !== folderId);
        setSelectedFolder(remainingFolders.length > 0 ? remainingFolders[0] : null);
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

  // Reorder folders
  const reorderFolders = async (folderIds) => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/folders/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ folderIds }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reorder folders');
      }
      
      const reorderedFolders = await response.json();
      setFolders(reorderedFolders);
      
      return true;
    } catch (err) {
      console.error('Error reordering folders:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get notes in a specific folder
  const getFolderNotes = async (folderId, options = {}) => {
    if (!user) return [];
    
    try {
      const { page = 1, limit = 20, search } = options;
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      
      const response = await fetch(`${API_URL}/folders/${folderId}/notes?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch folder notes');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching folder notes:', err);
      setError(err.message);
      return { notes: [], pagination: null };
    }
  };

  // Move note to folder
  const moveNoteToFolder = async (noteId, folderId) => {
    if (!user) return false;
    
    try {
      const response = await fetch(`${API_URL}/folders/notes/${noteId}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ folderId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to move note');
      }
      
      return true;
    } catch (err) {
      console.error('Error moving note:', err);
      setError(err.message);
      return false;
    }
  };

  // Load folders when user is available
  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  return (
    <FoldersContext.Provider value={{
      folders,
      selectedFolder,
      setSelectedFolder,
      loading,
      error,
      fetchFolders,
      createFolder,
      updateFolder,
      deleteFolder,
      reorderFolders,
      getFolderNotes,
      moveNoteToFolder
    }}>
      {children}
    </FoldersContext.Provider>
  );
}

export const useFolders = () => {
  const context = useContext(FoldersContext);
  if (!context) {
    throw new Error('useFolders must be used within a FoldersProvider');
  }
  return context;
};