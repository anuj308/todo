import api from './api';

const formatDateParam = (date) => {
  if (!date) {
    throw new Error('Date is required');
  }
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid date value');
  }
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDiaryEntry = async (date) => {
  try {
    const formatted = formatDateParam(date);
    const response = await api.get('/daily-diary', {
      params: { date: formatted },
    });
    return response.data;
  } catch (error) {
    console.error('Fetch diary entry error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to load diary entry');
  }
};

export const saveDiaryEntry = async (date, content) => {
  try {
    const formatted = formatDateParam(date);
    const response = await api.post('/daily-diary', {
      date: formatted,
      content,
    });
    return response.data;
  } catch (error) {
    console.error('Save diary entry error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to save diary entry');
  }
};
