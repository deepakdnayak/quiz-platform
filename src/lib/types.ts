export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'Student' | 'Instructor' | 'Admin';
  };
}

export interface QuizforInstructorDashboard {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  completions?: number; // for instructor quizzes
}

export interface QuizforStudentDashboardCompleted {
  quizId: string,
  title: string,
  totalScore: number,
  attemptDate:string
}

export interface QuizforStudentDashboardUpcoming {
  id: string,
  title: string,
  startTime: string
}

export interface StudentDashboard {
  completedQuizzes: QuizforStudentDashboardCompleted[];
  upcomingQuizzes: QuizforStudentDashboardUpcoming[];
  averageScore: number;
}

export interface InstructorDashboard {
  totalQuizzes: number,
  activeQuizzes: QuizforInstructorDashboard[],
  averageAttemptsPerQuiz: number,
  averageScoreAcrossQuizzes: number
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