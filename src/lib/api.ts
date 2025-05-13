import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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