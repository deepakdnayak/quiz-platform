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
  _id: string,
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