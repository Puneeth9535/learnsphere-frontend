import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

export const courseAPI = {
  getAll: (params) => API.get('/courses', { params }),
  getById: (id) => API.get(`/courses/${id}`),
  getAllAdmin: () => API.get('/courses/admin/all'),
  create: (data) => API.post('/courses', data),
  update: (id, data) => API.put(`/courses/${id}`, data),
  delete: (id) => API.delete(`/courses/${id}`),
};

export const enrollmentAPI = {
  // POST /enrollments with { courseId } — fixed path (was /enrollments/enroll)
  enroll: (courseId) => API.post('/enrollments', { courseId }),
  // GET /enrollments/my — returns list with { course, enrolledAt, ... }
  getMyEnrollments: () => API.get('/enrollments/my'),
  checkEnrollment: (courseId) => API.get(`/enrollments/check/${courseId}`),
  getAllEnrollments: () => API.get('/enrollments/admin/all'),
};

export const progressAPI = {
  // POST /progress/complete with { courseId, videoId }
  markComplete: (data) => API.post('/progress/complete', data),
  // GET /progress/:courseId — returns { progressPercentage, completedVideos, isCompleted, ... }
  getCourseProgress: (courseId) => API.get(`/progress/${courseId}`),
  // GET /progress/my — returns array with { course, progressPercentage, isCompleted }
  getMyProgress: () => API.get('/progress/my'),
};

export const certificateAPI = {
  generate: (courseId) => API.post('/certificates/generate', { courseId }),
  getMyCertificates: () => API.get('/certificates/my'),
  verify: (id) => API.get(`/certificates/verify/${id}`),
};

export const paymentAPI = {
  createIntent: (courseId) => API.post('/payment/create-intent', { courseId }),
  confirm: (data) => API.post('/payment/confirm', data),
};

export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getUsers: () => API.get('/admin/users'),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  updateRole: (id, role) => API.put(`/admin/users/${id}/role`, { role }),
};

export const moduleAPI = {
  create: (data) => API.post('/modules', data),
  update: (id, data) => API.put(`/modules/${id}`, data),
  delete: (id) => API.delete(`/modules/${id}`),
  getByCourse: (courseId) => API.get(`/modules/course/${courseId}`),
};

export const videoAPI = {
  create: (data) => API.post('/videos', data),
  update: (id, data) => API.put(`/videos/${id}`, data),
  delete: (id) => API.delete(`/videos/${id}`),
};

export default API;