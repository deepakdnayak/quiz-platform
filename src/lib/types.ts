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

export interface AdminDashboard {
  users: { id: string; email: string; role: string }[];
  stats: {
    userCount: number;
    quizCount: number;
  };
}