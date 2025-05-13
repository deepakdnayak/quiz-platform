import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
console.log('API baseURL:', baseURL); // Debug log

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests, except for auth endpoints
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const isAuthRequest = config.url?.includes('/api/auth/');
  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (data: { email: string; password: string; role: string }) => {
  try {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Registration failed');
  }
};

export const login = async (data: { email: string; password: string }) => {
  try {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

export const getStudentDashboard = async () => {
  try {
    const response = await api.get('/api/students/dashboard');
    console.log('Student Dashboard Response:', response.data); // Debug log
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch student dashboard');
  }
};

export const getInstructorDashboard = async () => {
  try {
    const response = await api.get('/api/instructors/dashboard');
    console.log('Instructor Dashboard Response:', response.data); // Debug log
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch instructor dashboard');
  }
};

export const getAdminStatistics = async () => {
  try {
    const response = await api.get('/api/admin/statistics');
    console.log('Admin Statistics Response:', response.data); // Debug log
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch admin statistics');
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const response = await api.delete(`/api/admin/users/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to delete user');
  }
};

export const updateUserRole = async (userId: string, role: string) => {
  try {
    const response = await api.patch(`/api/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to update user role');
  }
};

export const approveUser = async (userId: string) => {
  try {
    const response = await api.post(`/api/admin/users/${userId}/approve`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to approve user');
  }
};

export const getUserProgress = async (userId: string) => {
  try {
    const response = await api.get(`/api/admin/students/${userId}/progress`);
    console.log('User Progress Response:', response.data); // Debug log
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch user progress');
  }
};

export const getNotifications = async () => {
  try {
    const response = await api.get('/api/admin/notifications');
    console.log('Notifications Response:', response.data); // Debug log
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch notifications');
  }
};