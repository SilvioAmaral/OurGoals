import { api } from './client';

// Auth
export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  google: (idToken: string) =>
    api.post('/auth/google', { idToken }),
};

// User
export const userApi = {
  me: () => api.get('/users/me'),
  update: (data: { name?: string; theme?: string; sexualityEnabled?: boolean; partnerNickname?: string }) =>
    api.put('/users/me', data),
  delete: () => api.delete('/users/me'),
};

// Partner
export const partnerApi = {
  get: () => api.get('/partner'),
  invite: (contact: string, partnerName?: string) => api.post('/partner/invite', { contact, partnerName }),
  accept: (token: string) => api.post(`/partner/accept/${token}`, {}),
};

// Categories
export const categoryApi = {
  list: () => api.get('/categories'),
  subcategories: (id: string) => api.get(`/categories/${id}/subcategories`),
  create: (name: string, colorHue?: number) =>
    api.post('/categories', { name, colorHue }),
  delete: (id: string) => api.delete(`/categories/${id}`),
  toggleSexuality: (enabled: boolean) =>
    api.post('/categories/sexuality', { enabled }),
};

// Items
export const itemApi = {
  list: (categoryId: string) => api.get(`/categories/${categoryId}/items`),
  create: (categoryId: string, name: string) =>
    api.post(`/categories/${categoryId}/items`, { name }),
  delete: (categoryId: string, itemId: string) =>
    api.delete(`/categories/${categoryId}/items/${itemId}`),
  detail: (categoryId: string, itemId: string) =>
    api.get(`/categories/${categoryId}/items/${itemId}`),
  rate: (categoryId: string, itemId: string, value: number) =>
    api.put(`/categories/${categoryId}/items/${itemId}/rating`, { value }),
};

// Setup seed
export const setupApi = {
  seed: () => api.post('/setup/seed'),
};

// Match & Progress
export const matchApi = {
  get: () => api.get('/match'),
};

export const progressApi = {
  get: () => api.get('/progress'),
};
