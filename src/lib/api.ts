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
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch student dashboard');
  }
};

export const getInstructorDashboard = async () => {
  try {
    const response = await api.get('/api/instructors/dashboard');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch instructor dashboard');
  }
};

export const getAdminDashboard = async () => {
  try {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch admin dashboard');
  }
};