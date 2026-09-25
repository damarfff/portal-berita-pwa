import api from './api';

export const getPreferences = async () => {
  const response = await api.get('/preferences');
  return response.data.preferences;
};

export const updatePreferences = async (preferences) => {
  const response = await api.put('/preferences', preferences);
  return response.data.preferences;
};

export const getCategoryPreferences = async () => {
  const response = await api.get('/preferences/categories');
  return response.data.categories;
};

export const updateCategoryPreferences = async (categoryIds) => {
  const response = await api.put('/preferences/categories', {
    categoryIds
  });
  return response.data.categories;
};