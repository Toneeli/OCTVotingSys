import client from './client';

export const getPendingResidents = () => {
  return client.get('/admin/residents/pending');
};

export const approveResident = (id, status) => {
  return client.patch(`/admin/residents/${id}/approve`, { status });
};

export const setBuildingAdmin = (id, building) => {
  return client.patch(`/admin/residents/${id}/set-building-admin`, { building });
};

export const getCurrentUser = () => {
  return client.get('/admin/user/current');
};

export const getAllResidents = () => {
  return client.get('/admin/residents');
};

export const updateResident = (id, data) => {
  return client.patch(`/admin/residents/${id}`, data);
};

// 删除业主
export const deleteResident = (id) => {
  return client.delete(`/admin/residents/${id}`);
};

// 数据备份
export const backupData = () => {
  return client.post('/admin/backup', {});
};

// 数据恢复
export const restoreData = (backupData) => {
  return client.post('/admin/restore', { data: backupData });
};
