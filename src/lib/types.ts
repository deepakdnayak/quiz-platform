export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'Student' | 'Instructor' | 'Admin';
  };
}