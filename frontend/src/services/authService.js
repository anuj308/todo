// API service for authentication
const API_URL = '/api/users';

// Register user
export const register = async (userData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  // Save user to localStorage
  if (data.token) {
    localStorage.setItem('user', JSON.stringify(data));
  }

  return data;
};

// Login user
export const login = async (userData) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Invalid credentials');
  }

  // Save user to localStorage
  if (data.token) {
    localStorage.setItem('user', JSON.stringify(data));
  }

  return data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('user');
};

// Get current user
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

// Get auth token
export const getToken = () => {
  const user = getCurrentUser();
  return user?.token;
};

// Get auth header
export const getAuthHeader = () => {
  const token = getToken();
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  } else {
    return {};
  }
};

// Create authenticated fetch function
export const authFetch = async (url, options = {}) => {
  // Get the token
  const token = getToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  // Merge headers with auth header
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle response
  const data = await response.json();
  
  if (!response.ok) {
    // If unauthorized, log the user out
    if (response.status === 401) {
      logout();
    }
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

// Get user profile
export const getProfile = async () => {
  return authFetch(`${API_URL}/me`);
};