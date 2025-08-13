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
  quizId: string;
  title: string;
  totalScore: number;
  attemptDate:string;
  endTime: string;
}

export interface QuizforStudentDashboardUpcoming {
  id: string,
  title: string,
  startTime: string
  endTime: string
}

export interface QuizforStudentDashboardActive {
  id: string,
  title: string,
  startTime: string
  endTime: string
}

export interface StudentDashboard {
  completedQuizzes: QuizforStudentDashboardCompleted[];
  activeQuizzes: QuizforStudentDashboardActive[];
  upcomingQuizzes: QuizforStudentDashboardUpcoming[];
  averageScore: number;
}

// export interface InstructorDashboard {
//   totalQuizzes: number,
//   activeQuizzes: QuizforInstructorDashboard[],
//   averageAttemptsPerQuiz: number,
//   averageScoreAcrossQuizzes: number
// }

export interface InstructorDashboard {
  totalQuizzes: number;
  activeQuizzes: {     // new one - check if probem
    id: string;
    title: string;
    startTime: string;
    endTime: string;
  }[];
  averageAttemptsPerQuiz: number;
  averageScoreAcrossQuizzes: number;
  isApproved: boolean;
}

export interface InstructorQuiz {
  quizId: string;
  title: string;
  yearOfStudy: number;
  startTime: string;
  endTime: string;
  totalAttempts: number;
}

export interface QuizStatistics {
  quizId: string;
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  attemptsByYear: {
    yearOfStudy: string;
    count: number;
  }[];
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
  student: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    yearOfStudy: number;
  };
  attempts: {
    quizId: string;
    title: string;
    totalScore: number;
    attemptDate: string;
  }[];
  averageScore: number; // e.g., 0.5 for 50%
  totalQuizzesAttempted: number;
  quizzes: {
    id: string;
    title: string;
    score: number; // percentage value for UI
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

export interface CreateQuizForm {
  title: string;
  description: string;
  yearOfStudy: number;
  startTime: string;
  endTime: string;
  duration: number;
  questions: {
    text: string;
    score: number;
    options: {
      text: string;
      isCorrect: boolean;
    }[];
  }[];
}

export interface QuizDetails {
  id: string;
  title: string;
  description: string;
  duration: number;
  startTime: string;
  endTime: string;
  questions: {
    questionId: string;
    text: string;
    score: number;
    options: { optionId: string; text: string }[];
  }[];
}

export interface QuizAttempt {
  answers: { questionId: string; selectedOptionIds: string[] }[];
}

export interface QuizResults {
  attempt: {
    attemptId: string;
    quizId: string;
    totalScore: number;
    answers: {
      questionId: string;
      selectedOptionIds: string[];
      isCorrect: boolean;
      scoreAwarded: number;
      _id: string;
    }[];
  };
  quiz: {
    questions: {
      questionId: string;
      text: string;
      options: {
        text: string;
        isCorrect: boolean;
        _id: string;
        optionId: string;
      }[];
      correctOptionIds: string[];
      score: number;
    }[];
  };
}


// export interface RunningQuizes {
//   totalQuizzes: number,
//   activeQuizzes: QuizforInstructorDashboard[],
//   averageAttemptsPerQuiz: number,
//   averageScoreAcrossQuizzes: number
// }


export interface Profile {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  yearOfStudy: string | null;
  department: string;
  rollNumber: string | null;
}

export interface ProfileResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
  profile: Profile | null;
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  yearOfStudy: string | null;
  department: string;
  rollNumber: string | null;
}

export interface QuizResultForInstructor {
  usn: string;
  studentName: string;
  score: number;
  yearOfStudy: string;
  rollNumber: string;
  attemptDate: string;
}

// Interface for statistics data
export interface Stats {
  totalQuizzes: number;
  totalStudents: number;
  totalInstructors: number;
}

// Interface for API response
export interface StatsResponse {
  stats: Stats;
}

// Add to existing types.ts
export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}