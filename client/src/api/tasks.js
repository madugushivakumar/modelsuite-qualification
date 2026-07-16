import API from './axios';

export const fetchAllTasks = (page = 1, limit = 10) =>
  API.get(`/tasks?page=${page}&limit=${limit}`);
export const createTask = (data) => API.post('/tasks', data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const fetchTalents = () => API.get('/users/talents');
