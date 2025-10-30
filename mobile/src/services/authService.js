import api from './api';
import { saveToken, saveUser, clearAllData } from '../utils/storage';

// Register user
export const register = async (name, email, password) => {
  try {
    const response = await api.post('/users', { name, email, password });
    const { token, user } = response.data;
    
    // Save token and user to AsyncStorage
    await saveToken(token);
    await saveUser(user);
    
    return { token, user };
  } catch (error) {
    throw error;
  }
};

// Login user
export const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });
    const { token, user } = response.data;
    
    // Save token and user to AsyncStorage
    await saveToken(token);
    await saveUser(user);
    
    return { token, user };
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me');
    const user = response.data;
    
    // Update user in AsyncStorage
    await saveUser(user);
    
    return user;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logout = async () => {
  try {
    await api.post('/users/logout');
  } catch (error) {
    console.error('Logout API error:', error);
    // Continue with local logout even if API fails
  } finally {
    // Clear local storage
    await clearAllData();
  }
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
