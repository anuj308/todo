// API service for authentication
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/users`;

// Register user
export const register = async (userData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies in request
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  // No need to save token to localStorage - it's in httpOnly cookie
  return data;
};

// Login user
export const login = async (userData) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies in request
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Invalid credentials');
  }

  // No need to save token to localStorage - it's in httpOnly cookie
  return data;
};

// Logout user
export const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include', // Include cookies in request
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    // Even if the server request fails, we should still clear any local state
    throw error;
  }
};

// Create authenticated fetch function
export const authFetch = async (url, options = {}) => {
  // Make the request with credentials included for cookies
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      // No Authorization header needed anymore
    },
  });

  // Handle response
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'API request failed');
  }

  return await response.json();
};

// Get user profile
export const getProfile = async () => {
  return authFetch(`${API_URL}/me`);
};