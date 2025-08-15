'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'; // Import Recharts components
import { getStudentDashboard, getProfile, updateProfile } from '@/lib/api';
import { StudentDashboard, Profile, UpdateProfileData } from '@/lib/types';

// Utility to format ISO date to 12-hour IST format (e.g., "2:30 PM, Aug 06, 2025")
const formatISTDate = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istDate = new Date(date.getTime() + istOffset);
    
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    };
    return istDate.toLocaleString('en-IN', options).replace(',', '');
  } catch {
    return 'N/A';
  }
};

// Utility to check if quiz end time has passed (in IST)
const isQuizEnded = (endTime: string): boolean => {
  const endDate = new Date(endTime);
  const currentTime = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(currentTime.getTime() + istOffset);
  return istTime > endDate;
};

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboard | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: '',
    lastName: '',
    yearOfStudy: '',
    department: '',
    rollNumber: '',
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to access the dashboard');
      router.push('/auth/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [dashboardResponse, profileResponse] = await Promise.all([
          getStudentDashboard(),
          getProfile(),
        ]);
        setData(dashboardResponse);
        setProfile(profileResponse.profile);
        setFormData({
          firstName: profileResponse.profile?.firstName || '',
          lastName: profileResponse.profile?.lastName || '',
          yearOfStudy: profileResponse.profile?.yearOfStudy || '',
          department: profileResponse.profile?.department || '',
          rollNumber: profileResponse.profile?.rollNumber || '',
        });
        
        setIsProfileComplete(!(isDefaultValue('firstName', profileResponse.profile?.firstName || '') || isDefaultValue('lastName', profileResponse.profile?.lastName || '') || isDefaultValue('yearOfStudy', profileResponse.profile?.yearOfStudy || '') || isDefaultValue('department', profileResponse.profile?.department || '') || isDefaultValue('rollNumber', profileResponse.profile?.rollNumber || '')));
          
        console.log(isProfileComplete);
        // toast.success('Dashboard and profile loaded successfully');
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message || 'Failed to load dashboard or profile');
        } else if (typeof error === 'string') {
          toast.error(error || 'Failed to load dashboard or profile');
        } else {
          toast.error('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSaveProfile = async () => {
    try {
      const response = await updateProfile(formData);
      setProfile(response.profile);
      setIsEditing(false);
      localStorage.setItem('profile', JSON.stringify(response.profile));
      window.dispatchEvent(new Event('storageChange')); // Notify Navbar
      setIsProfileComplete(
      !(
        isDefaultValue('firstName', response.profile.firstName) ||
        isDefaultValue('lastName', response.profile.lastName) ||
        isDefaultValue('yearOfStudy', response.profile.yearOfStudy) ||
        isDefaultValue('department', response.profile.department) ||
        isDefaultValue('rollNumber', response.profile.rollNumber)
      )
    );
      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to update profile');
      } else if (typeof error === 'string') {
        toast.error(error || 'Failed to update profile');
      } else {
        toast.error('An unknown error occurred');
      }
    }
  };

  const isDefaultValue = (field: keyof UpdateProfileData, value: string | null) => {
    if (!value) return false;
    switch (field) {
      case 'firstName':
        return value === 'FirstName';
      case 'lastName':
        return value === 'LastName';
      case 'department':
        return value === 'CEC';
      case 'yearOfStudy':
        return value === '0';
      case 'rollNumber':
        return value=== '4CB00XX000';
      default:
        return false;
    }
  };

  const isQuizAttempted = (quizId: string | undefined): boolean => {
    if (!quizId || !data?.completedQuizzes) return false;
    return data.completedQuizzes.some((completedQuiz) => completedQuiz.quizId === quizId);
  };

  const getProgressData = () => {
    if (!data?.completedQuizzes) return [];
    const sortedQuizzes = [...data.completedQuizzes].sort((a, b) => new Date(b.attemptDate).getTime() - new Date(a.attemptDate).getTime());
    const recentQuizzes = sortedQuizzes.slice(0, Math.min(5, sortedQuizzes.length));
    return recentQuizzes.map(quiz => ({
      date: formatISTDate(quiz.attemptDate),
      title: quiz.title,
      scorePercentage: quiz.fullMarks ? (quiz.totalScore / quiz.fullMarks) * 100 : 0,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || !profile) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.error('Please login to access dashboard');
    return router.push('/');
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-primary mb-6 text-center sm:text-left">Student Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Student Details Card (Left Half) */}
        <div className="col-span-1">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Student Details</CardTitle>
              <Button variant={'grayscale'} onClick={handleEditToggle}>
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </CardHeader>
            <CardContent className="h-[calc(100%-48px)] overflow-y-auto">
              {isEditing ? (
                <div className="grid gap-4">
                  {/* First Name */}
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName === 'FirstName' ? '' : formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName === 'LastName' ? '' : formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                      required
                    />
                  </div>

                  {/* Year of Study */}
                  <div>
                    <Label htmlFor="yearOfStudy">Year of Study</Label>
                    <select
                      id="yearOfStudy"
                      name="yearOfStudy"
                      value={formData.yearOfStudy === '0' ? '' : formData.yearOfStudy || ''}
                      onChange={handleInputChange}
                      required
                      className="border rounded p-2 w-full"
                    >
                      <option value="" disabled>Select year</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>

                  {/* Department */}
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department === 'CEC' ? '' : formData.department || ''}

                      onChange={handleInputChange}
                      required
                      className="border rounded p-2 w-full"
                    >
                      <option value="" disabled>Select department</option>
                      {/* Replace these with your actual departments */}
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="MECH">MECH</option>
                      <option value="CIVIL">CIVIL</option>
                    </select>
                  </div>

                  {/* Roll Number / USN */}
                  <div>
                    <Label htmlFor="rollNumber">USN</Label>
                    <Input
                      type="text"
                      id="rollNumber"
                      name="rollNumber"
                      value={formData.rollNumber === '4CB00XX000' ? '' : formData.rollNumber || ''}
                      onChange={handleInputChange}
                      placeholder="Enter USN (e.g. 4CB00XX000)"
                      pattern="^4CB\d{2}[A-Za-z]{2}\d{3}$"
                      title="USN must be in the format 4CB00XX000"
                      required
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button variant="grayscale" onClick={handleSaveProfile}>
                      Save
                    </Button>
                  </div>
                </div>

              ) : (
                <div className="grid gap-4">
                  <div>
                    <span className="font-semibold">First Name: </span>
                    {isDefaultValue('firstName', profile.firstName) ? (
                      <span className="text-red-500">Please add first name</span>
                    ) : (
                      profile.firstName
                    )}
                  </div>
                  <div>
                    <span className="font-semibold">Last Name: </span>
                    {isDefaultValue('lastName', profile.lastName) ? (
                      <span className="text-red-500">Please add last name</span>
                    ) : (
                      profile.lastName
                    )}
                  </div>
                  <div>
                    <span className="font-semibold">Year of Study: </span>
                    {isDefaultValue('yearOfStudy', profile.yearOfStudy) ? (
                      <span className="text-red-500">Please add year of study</span>
                    ) : (
                      profile.yearOfStudy || 'N/A'
                    )}
                  </div>
                  <div>
                    <span className="font-semibold">Department: </span>
                    {isDefaultValue('department', profile.department) ? (
                      <span className="text-red-500">Please add department of study</span>
                    ) : (
                      profile.department
                    )}
                  </div>
                  <div>
                    <span className="font-semibold">USN: </span>
                    {isDefaultValue('rollNumber', profile.rollNumber) ? (
                      <span className="text-red-500">Please add usn</span>
                    ) : (
                      profile.rollNumber || 'N/A'
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progress Graph Card (Right Half) */}
        <div className="col-span-1 hidden md:block">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Progress Graph</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-48px)] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getProgressData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="scorePercentage"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* No Profile Box */}
      {!isProfileComplete && (
      <div className="mb-8 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="animate-pulse text-red-500">Please Update Profile to attempt quizes{isProfileComplete}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      )}

      {/* Quizzes Completed and Average Score */}
      {isProfileComplete && (
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quizzes Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {data.completedQuizzes.length ?? 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {data.averageScore ? `${(data.averageScore * 100).toFixed(2)}%` : '0'}
            </p>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Upcoming Quizzes */}
      {isProfileComplete && (
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingQuizzes?.length === 0 ? (
              <p>No quizzes available</p>
            ) : (
              <div className="overflow-x-auto">
                <Table className="table-fixed w-full min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Title</TableHead>
                      <TableHead className="w-1/4">Start Time</TableHead>
                      <TableHead className="w-1/4">End Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.upcomingQuizzes?.map((quiz, index) => (
                      <TableRow key={quiz.id ?? `quiz-${index}`}>
                        <TableCell className="w-1/4">{quiz.title}</TableCell>
                        <TableCell className="w-1/4">{formatISTDate(quiz.startTime)}</TableCell>
                        <TableCell className="w-1/4">{formatISTDate(quiz.endTime)}</TableCell>
                      </TableRow>
                    )) ?? <TableRow><TableCell colSpan={3}>No quizzes available</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {/* Active Quizzes */}
      {isProfileComplete && (
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Active Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            {data.activeQuizzes?.length === 0 ? (
              <p>No active quizzes</p>
            ) : (
              <div className="overflow-x-auto">
                <Table className="table-fixed w-full min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Title</TableHead>
                      <TableHead className="w-1/4">Start Time</TableHead>
                      <TableHead className="w-1/4">End Time</TableHead>
                      <TableHead className="w-1/4">Attempt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.activeQuizzes?.map((quiz, index) => (
                      <TableRow key={quiz.id ?? `quiz-${index}`}>
                        <TableCell className="w-1/4">{quiz.title}</TableCell>
                        <TableCell className="w-1/4">{formatISTDate(quiz.startTime)}</TableCell>
                        <TableCell className="w-1/4">{formatISTDate(quiz.endTime)}</TableCell>
                        <TableCell className="w-1/4">
                          <Button
                            variant={'grayscale'}
                            onClick={() => router.push(`/quiz/${quiz.id}`)}
                            disabled={!quiz.id || isQuizAttempted(quiz.id)}
                            title={isQuizAttempted(quiz.id) ? 'Quiz already attempted' : 'Start quiz'}
                          >
                            Start Quiz
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) ?? <TableRow><TableCell colSpan={4}>No quizzes active</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {/* Completed Quizzes */}
      {isProfileComplete && (
      <Card>
        <CardHeader>
          <CardTitle>Completed Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          {data.completedQuizzes?.length === 0 ? (
            <p>No quizzes available</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="table-fixed w-full min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Title</TableHead>
                    <TableHead className="w-1/4">Score</TableHead>
                    <TableHead className="w-1/4">Attempt Date</TableHead>
                    <TableHead className="w-1/4">Results</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.completedQuizzes?.map((quiz, index) => {
                    const canViewResults = isQuizEnded(quiz.endTime);
                    return (
                      <TableRow key={quiz.quizId ?? `quiz-${index}`}>
                        <TableCell className="w-1/4">{quiz.title}</TableCell>
                        <TableCell className="w-1/4">{quiz.totalScore}</TableCell>
                        <TableCell className="w-1/4">{formatISTDate(quiz.attemptDate)}</TableCell>
                        <TableCell className="w-1/4">
                          <Button
                            variant={'grayscale'}
                            onClick={() => router.push(`/quiz/${quiz.quizId}/results`)}
                            disabled={!quiz.quizId || !canViewResults}
                            title={canViewResults ? 'View quiz results' : 'Results available after quiz ends'}
                          >
                            View Results
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  }) ?? <TableRow><TableCell colSpan={4}>No quizzes available</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      )}

    </div>
  );
}