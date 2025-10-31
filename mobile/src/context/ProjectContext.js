import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as projectService from '../services/projectService';

const ProjectContext = createContext();

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchProjectById = useCallback(async (id) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjectById(id);
      setCurrentProject(data);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addProject = useCallback(async (projectData) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const newProject = await projectService.createProject(projectData);
      setProjects((prev) => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const editProject = useCallback(async (id, projectData) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const updatedProject = await projectService.updateProject(id, projectData);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updatedProject : p))
      );
      if (currentProject?.id === id) {
        setCurrentProject(updatedProject);
      }
      return updatedProject;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, currentProject]);

  const removeProject = useCallback(async (id) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await projectService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, currentProject]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
    }
  }, [user, fetchProjects]);

  const value = {
    projects,
    currentProject,
    loading,
    error,
    fetchProjects,
    fetchProjectById,
    addProject,
    editProject,
    removeProject,
    setCurrentProject,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
