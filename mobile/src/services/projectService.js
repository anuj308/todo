import api from './api';

export const getProjects = async () => {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch projects');
  }
};

export const getProjectById = async (id) => {
  try {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch project');
  }
};

export const createProject = async (projectData) => {
  try {
    const response = await api.post('/projects', projectData);
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create project');
  }
};

export const updateProject = async (id, projectData) => {
  try {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  } catch (error) {
    console.error(`Error updating project ${id}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update project');
  }
};

export const deleteProject = async (id) => {
  try {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting project ${id}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete project');
  }
};
