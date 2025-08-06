'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getStudentDashboard, getProfile, updateProfile } from '@/lib/api';
import { StudentDashboard, Profile, UpdateProfileData } from '@/lib/types';

// Utility to format ISO date to 12-hour IST format (e.g., "2:30 PM, Aug 06, 2025")
const formatISTDate = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istDate = new Date(date.getTime() + istOffset);
    
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC', // Base on UTC and adjust manually with offset
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
  // Convert current time to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  const istTime = new Date(currentTime.getTime() + istOffset);
  return istTime > endDate;
};

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboard | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
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
        console.log('Student Dashboard API Response:', dashboardResponse); // Debug log
        console.log('Profile API Response:', profileResponse); // Debug log
        setData(dashboardResponse);
        setProfile(profileResponse.profile);
        setFormData({
          firstName: profileResponse.profile?.firstName || '',
          lastName: profileResponse.profile?.lastName || '',
          yearOfStudy: profileResponse.profile?.yearOfStudy || '',
          department: profileResponse.profile?.department || '',
          rollNumber: profileResponse.profile?.rollNumber || '',
        });
        toast.success('Dashboard and profile loaded successfully');
      } catch (error: any) {
        console.error('Error fetching data:', error); // Debug log
        toast.error(error.message || 'Failed to load dashboard or profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
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
        return value === 'General';
      case 'yearOfStudy':
        return value === '1';
      case 'rollNumber':
        return value?.startsWith('RN') ?? false;
      default:
        return false;
    }
  };

  // Check if a quiz has been attempted by matching id with completedQuizzes
  const isQuizAttempted = (quizId: string | undefined): boolean => {
    if (!quizId || !data?.completedQuizzes) return false;
    return data.completedQuizzes.some((completedQuiz) => completedQuiz.quizId === quizId);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">Loading...</div>;
  }

  if (!data || !profile) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">No data available</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Student Dashboard</h1>

      {/* Student Details Card */}
      <div className="mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Student Details</CardTitle>
            <Button onClick={handleEditToggle}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="yearOfStudy">Year of Study</Label>
                  <Input
                    type="number"
                    id="yearOfStudy"
                    name="yearOfStudy"
                    value={formData.yearOfStudy || ''}
                    onChange={handleInputChange}
                    placeholder="Enter year of study"
                    max={4}
                    min={1}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Enter department"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input
                    type="text"
                    id="rollNumber"
                    name="rollNumber"
                    value={formData.rollNumber || ''}
                    onChange={handleInputChange}
                    placeholder="Enter roll number"
                  />
                </div>
                <div className="flex justify-end">
                  <Button className="bg-primary hover:bg-blue-700" onClick={handleSaveProfile}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <div>
                  <span className="font-semibold">First Name: </span>
                  {isDefaultValue('firstName', profile.firstName) ? (
                    <span className="text-red-500">Please complete your profile</span>
                  ) : (
                    profile.firstName
                  )}
                </div>
                <div>
                  <span className="font-semibold">Last Name: </span>
                  {isDefaultValue('lastName', profile.lastName) ? (
                    <span className="text-red-500">Please complete your profile</span>
                  ) : (
                    profile.lastName
                  )}
                </div>
                <div>
                  <span className="font-semibold">Year of Study: </span>
                  {isDefaultValue('yearOfStudy', profile.yearOfStudy) ? (
                    <span className="text-red-500">Please complete your profile</span>
                  ) : (
                    profile.yearOfStudy || 'N/A'
                  )}
                </div>
                <div>
                  <span className="font-semibold">Department: </span>
                  {isDefaultValue('department', profile.department) ? (
                    <span className="text-red-500">Please complete your profile</span>
                  ) : (
                    profile.department
                  )}
                </div>
                <div>
                  <span className="font-semibold">Roll Number: </span>
                  {isDefaultValue('rollNumber', profile.rollNumber) ? (
                    <span className="text-red-500">Please complete your profile</span>
                  ) : (
                    profile.rollNumber || 'N/A'
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quizzes Completed and Average Score */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
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
              {data.averageScore ? `${data.averageScore}` : '0'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Quizzes */}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.upcomingQuizzes?.map((quiz, index) => (
                      <TableRow key={quiz.id ?? `quiz-${index}`}>
                        <TableCell>{quiz.title}</TableCell>
                        <TableCell>{formatISTDate(quiz.startTime)}</TableCell>
                        <TableCell>{formatISTDate(quiz.endTime)}</TableCell>
                      </TableRow>
                    )) ?? <TableRow><TableCell colSpan={3}>No quizzes available</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Quizzes */}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Attempt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.activeQuizzes?.map((quiz, index) => (
                      <TableRow key={quiz.id ?? `quiz-${index}`}>
                        <TableCell>{quiz.title}</TableCell>
                        <TableCell>{formatISTDate(quiz.startTime)}</TableCell>
                        <TableCell>{formatISTDate(quiz.endTime)}</TableCell>
                        <TableCell>
                          <Button
                            className="bg-primary hover:bg-blue-700"
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

      {/* Completed Quizzes */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          {data.completedQuizzes?.length === 0 ? (
            <p>No quizzes available</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Attempt Date</TableHead>
                    <TableHead>Results</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.completedQuizzes?.map((quiz, index) => {
                    const canViewResults = isQuizEnded(quiz.endTime);
                    return (
                      <TableRow key={quiz.quizId ?? `quiz-${index}`}>
                        <TableCell>{quiz.title}</TableCell>
                        <TableCell>{quiz.totalScore}</TableCell>
                        <TableCell>{formatISTDate(quiz.attemptDate)}</TableCell>
                        <TableCell>
                          <Button
                            className="bg-primary hover:bg-blue-700"
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
    </div>
  );
}