import api from './api';

export const getProductivityMetrics = async () => {
  try {
    const response = await api.get('/productivity-metrics');
    return response.data;
  } catch (error)
  {
    console.error('Error fetching productivity metrics:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch productivity metrics');
  }
};

export const getTimeLogs = async (filters = {}) => {
  try {
    const response = await api.get('/time-logs', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching time logs:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch time logs');
  }
};
