import api from './api';

export const getArticles = async () => {
  const response = await api.get('/articles');
  return response.data.articles;
};

export const getArticleBySlug = async (slug) => {
  const response = await api.get(`/articles/${slug}`);
  return response.data.article;
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data.categories;
};