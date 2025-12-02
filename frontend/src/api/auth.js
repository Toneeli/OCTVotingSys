import client from './client';

export const register = (data) => {
  return client.post('/auth/register', data);
};

export const login = (data) => {
  return client.post('/auth/login', data);
};

export const getProfile = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const changePassword = (data) => {
  return client.patch('/auth/change-password', data);
};
