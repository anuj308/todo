import api from './api';

// Fetch all folders
export const getFolders = async () => {
  try {
    const response = await api.get('/folders');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new folder
export const createFolder = async (folderData) => {
  try {
    const response = await api.post('/folders', folderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update a folder
export const updateFolder = async (folderId, updates) => {
  try {
    const response = await api.put(`/folders/${folderId}`, updates);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a folder
export const deleteFolder = async (folderId) => {
  try {
    const response = await api.delete(`/folders/${folderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get folder by ID
export const getFolderById = async (folderId) => {
  try {
    const response = await api.get(`/folders/${folderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
