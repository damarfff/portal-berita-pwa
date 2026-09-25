import api from './api';

export const getAllArticlesAdmin = async (status = null) => {
  const url = status ? `/admin/articles?status=${status}` : '/admin/articles';
  const response = await api.get(url);
  return response.data.articles;
};

export const getArticleById = async (id) => {
  const response = await api.get(`/admin/articles`);
  const articles = response.data.articles;
  return articles.find(a => a.id === parseInt(id));
};

export const createArticle = async (formData) => {
  const response = await api.post('/admin/articles', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.article;
};

export const updateArticle = async (id, formData) => {
  const response = await api.put(`/admin/articles/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.article;
};

export const publishArticle = async (id) => {
  const response = await api.patch(`/admin/articles/${id}/publish`);
  return response.data.article;
};

export const deleteArticle = async (id) => {
  const response = await api.delete(`/admin/articles/${id}`);
  return response.data;
};

export const createCategory = async (nama) => {
  const response = await api.post('/admin/categories', { nama });
  return response.data.category;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/admin/categories/${id}`);
  return response.data;
};