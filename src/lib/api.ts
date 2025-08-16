import axios from 'axios';
import { CreateQuizForm, UpdateQuizForm, QuizResultForInstructor, StatsResponse, InstructorDashboard, InstructorQuiz, QuizStatistics, QuizDetails, QuizAttempt, QuizResults, Profile, ProfileResponse, UpdateProfileData, ForgotPasswordResponse } from './types';


const baseURL = process.env.NEXT_PUBLIC_NODE_ENV=="production" ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000'; 
// console.log('API baseURL:', baseURL); // Debug log

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
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Registration failed');
    }
    throw new Error('Registration failed');
  }
};

export const login = async (data: { email: string; password: string }) => {
  try {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Login failed');
    }
    throw new Error('Login failed');
  }
};

export const getStudentDashboard = async () => {
  try {
    const response = await api.get('/api/students/dashboard');
    // console.log('Student Dashboard Response:', response.data); // Debug log
    return response.data;
  }
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to fetch student dashboard');
    }
    throw new Error('Failed to fetch student dashboard');
  }
};

export const getInstructorDashboard = async (): Promise<InstructorDashboard> => {
  try {
    const response = await api.get('/api/instructors/dashboard');
    // console.log('Get Instructor Dashboard Response:', response.data); // Debug log
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to fetch instructor dashboard');
    }
    throw new Error('Failed to fetch instructor dashboard');
  }
};

export const getInstructorQuizzes = async (status: 'all' | 'active' | 'upcoming' | 'past' = 'all'): Promise<InstructorQuiz[]> => {
  try {
    const response = await api.get('/api/instructors/quizzes', { params: { status } });
    // console.log('Get Instructor Quizzes Response:', response.data); // Debug log
    return response.data;
  }
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to fetch instructor quizzes');
    }
    throw new Error('Failed to fetch instructor quizzes');
  }
};

export const getQuizStatistics = async (quizId: string): Promise<QuizStatistics> => {
  try {
    const response = await api.get(`/api/quizzes/${quizId}/statistics?refresh=true`);
    // console.log('Get Quiz Statistics Response:', response.data); // Debug log
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to fetch quiz statistics');
    }
    throw new Error('Failed to fetch quiz statistics');
  }
};

export const getAdminStatistics = async () => {
  try {
    const response = await api.get('/api/admin/statistics');
    // console.log('Admin Statistics Response:', response.data); // Debug log
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to fetch admin statistics');
    }
    throw new Error('Failed to fetch admin statistics');
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const response = await api.delete(`/api/admin/users/${userId}`);
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to delete user');
    }
    throw new Error('Failed to delete user');
  }
};

export const updateUserRole = async (userId: string, role: string) => {
  try {
    const response = await api.patch(`/api/admin/users/${userId}/role`, { role });
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to update user role');
    }
    throw new Error('Failed to update user role');
  }
};

export const approveUser = async (userId: string, approval: boolean) => {
  try {
    const response = await api.put(`/api/admin/users/${userId}/approve`, {
      isApproved: approval
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to approve user');
    }
    throw new Error('Failed to approve user');
  }
};


export const getUserProgress = async (userId: string) => {
  try {
    const response = await api.get(`/api/admin/students/${userId}/progress`);
    // console.log('User Progress Response:', response.data); // Debug log
    return response.data;
  }
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to fetch user progress');
    }
    throw new Error('Failed to fetch user progress');
  }
};

export const getNotifications = async () => {
  try {
    const response = await api.get('/api/admin/notifications');
    // console.log('Notifications Response:', response.data); // Debug log
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to fetch notifications');
    }
    throw new Error('Failed to fetch notifications');
  }
};

export const createQuiz = async (data: CreateQuizForm) => {
  try {
    const response = await api.post('/api/quizzes', data);
    // console.log('Create Quiz Response:', response.data); // Debug log
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to create quiz');
    }
    throw new Error('Failed to create quiz');
  }
};

export const updateQuiz = async (quizId: string, data: UpdateQuizForm) => {
  try {
    const response = await api.put(`/api/quizzes/${quizId}`, data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to update quiz');
    }
    throw new Error('Failed to update quiz');
  }
};

export const deleteQuiz = async (quizId: string) => {
  try {
    const response = await api.delete(`/api/quizzes/${quizId}`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to delete quiz');
    }
    throw new Error('Failed to delete quiz');
  }
};

export const getQuizDetails = async (quizId: string): Promise<QuizDetails> => {
  try {
    const response = await api.get(`/api/quizzes/${quizId}`);
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to fetch quiz details');
    }
    throw new Error('Failed to fetch quiz details');
  }
};

export const getQuizDetailsForEdit = async (quizId: string): Promise<UpdateQuizForm> => {
  try {
    const response = await api.get(`/api/quizzes/${quizId}/edit`);
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to fetch quiz details');
    }
    throw new Error('Failed to fetch quiz details');
  }
};

export const submitQuizAttempt = async (quizId: string, data: QuizAttempt): Promise<void> => {
  try {
    const response = await api.post(`/api/quizzes/${quizId}/attempt`, { answers: data.answers });
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to submit quiz attempt');
    }
    throw new Error('Failed to submit quiz attempt');
  }
};

export const getQuizResults = async (quizId: string): Promise<QuizResults> => {
  try {
    const response = await api.get(`/api/quizzes/${quizId}/results`);
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to fetch quiz results');
    }
    throw new Error('Failed to fetch quiz results');
  }
};


// export const getRunningQuizes = async () => {
//   try {
//     const response = await api.get(`/api/quizzes?status=active`);
//     return response.data;
//   } catch (error: any) {
//     throw new Error(error.response?.data?.message || 'Failed to fetch quiz results');
//   }
// };


export const getProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await api.get('/api/users/profile');
    // console.log('Get Profile Response:', response.data); // Debug log
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to fetch profile');
    }
    throw new Error('Failed to fetch profile');
  }
};

export const updateProfile = async (data: UpdateProfileData): Promise<{ profile: Profile }> => {
  try {
    const response = await api.put('/api/users/profile', data);
    // console.log('Update Profile Response:', response.data); // Debug log
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to update profile');
    }
    throw new Error('Failed to update profile');
  }
};

export const getQuizResultsForInstructor = async (quizId: string): Promise<QuizResultForInstructor[]> => {
  try {
    const response = await api.get(`/api/quizzes/${quizId}/resultsForInstructor`);
    // console.log('Get Quiz Results Response:', response.data); // Debug log
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to fetch quiz results');
    }
    throw new Error('Failed to fetch quiz results');
  }
};

export const getStatistics = async (): Promise<StatsResponse> => {
  try {
    const response = await api.get('/api/users/getUserCount');
    // console.log('Get Statistics Response:', response.data); // Debug log
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to fetch statistics');
    }
    throw new Error('Failed to fetch statistics');
  }
};

export const sendResetOTP = async (data: { email: string }): Promise<ForgotPasswordResponse> => {
  try {
    const response = await api.post('/api/auth/forgot-password', data);
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to send OTP');
    }
    throw new Error('Failed to send OTP');
  }
};

export const verifyResetOTP = async (data: { email: string; otp: string }): Promise<ForgotPasswordResponse> => {
  try {
    const response = await api.post('/api/auth/verify-otp', data);
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to verify OTP');
    }
    throw new Error('Failed to verify OTP');
  }
};

export const resetPassword = async (data: { email: string; newPassword: string }): Promise<ForgotPasswordResponse> => {
  try {
    const response = await api.post('/api/auth/reset-password', data);
    return response.data;
  } 
  catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Failed to reset password');
    }
    throw new Error('Failed to reset password');
  }
};