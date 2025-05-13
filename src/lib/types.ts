export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'Student' | 'Instructor' | 'Admin';
  };
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  completions?: number; // for instructor quizzes
}

export interface StudentDashboard {
  quizzes: Quiz[];
  stats: {
    completed: number;
    averageScore: number;
  };
}

export interface InstructorDashboard {
  quizzes: Quiz[];
  stats: {
    quizCount: number;
    totalCompletions: number;
  };
}

export interface AdminStatistics {
  totalUsers: number;
  studentCount: number;
  instructorCount: number;
  adminCount: number;
  totalQuizzes: number;
  totalCompletions: number;
  instructorDetails: {
    id: string;
    email: string;
    status: 'pending' | 'approved'; // Mapped from isApproved
  }[];
  studentDetails: {
    id: string;
    email: string;
    yearOfStudy?: number;
  }[];
  activeQuizzes: number;
  averageScore: number;
}

export interface UserProgress {
  quizzes: {
    id: string;
    title: string;
    score: number;
    completedAt: string;
  }[];
}

export interface Notification {
  id: string;
  userId: string;
  email: string;
  requestedRole: 'Instructor';
  createdAt: string;
}