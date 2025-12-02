import client from './client';

// 投票议题API
export const getTopics = () => {
  return client.get('/topics');
};

export const getTopic = (id) => {
  return client.get(`/topics/${id}`);
};

export const createTopic = (data) => {
  return client.post('/topics', data);
};

export const updateTopic = (id, data) => {
  return client.put(`/topics/${id}`, data);
};

// 更新投票议题的排序
export const updateTopicSort = (id, sortOrder) => {
  return client.patch(`/topics/${id}/sort`, { sort_order: sortOrder });
};

// 投票API
export const submitVote = (data) => {
  return client.post('/votes', data);
};

// 获取已投票的业主列表
export const getVoters = (topicId) => {
  return client.get(`/votes/topic/${topicId}`);
};

// 统计API
export const getStats = (topicId) => {
  return client.get(`/stats/topic/${topicId}`);
};
