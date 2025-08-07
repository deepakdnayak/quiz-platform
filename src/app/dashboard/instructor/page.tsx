'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { getInstructorDashboard, getInstructorQuizzes, getQuizStatistics } from '@/lib/api';
import { InstructorDashboard, InstructorQuiz, QuizStatistics } from '@/lib/types';

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

// Utility to determine quiz status
const getQuizStatus = (startTime: string, endTime: string): 'Active' | 'Upcoming' | 'Completed' => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (now < start) return 'Upcoming';
  if (now > end) return 'Completed';
  return 'Active';
};

export default function InstructorDashboardPage() {
  const [dashboardData, setDashboardData] = useState<InstructorDashboard | null>(null);
  const [quizzes, setQuizzes] = useState<InstructorQuiz[]>([]);
  const [quizStats, setQuizStats] = useState<{ [key: string]: QuizStatistics }>({});
  const [loading, setLoading] = useState(true);
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
        // Fetch dashboard data
        const dashboardResponse = await getInstructorDashboard();
        console.log('Instructor Dashboard API Response:', dashboardResponse); // Debug log
        setDashboardData(dashboardResponse);

        // Fetch all quizzes
        const quizzesResponse = await getInstructorQuizzes('all');
        console.log('Instructor Quizzes API Response:', quizzesResponse); // Debug log
        setQuizzes(quizzesResponse);

        // Fetch statistics for each quiz
        const statsPromises = quizzesResponse.map(async (quiz) => {
          try {
            const stats = await getQuizStatistics(quiz.quizId);
            return { quizId: quiz.quizId, stats };
          } catch (error) {
            console.error(`Error fetching stats for quiz ${quiz.quizId}:`, error); // Debug log
            return { quizId: quiz.quizId, stats: null };
          }
        });
        const statsResults = await Promise.all(statsPromises);
        const statsMap = statsResults.reduce((acc, { quizId, stats }) => {
          if (stats) acc[quizId] = stats;
          return acc;
        }, {} as { [key: string]: QuizStatistics });
        setQuizStats(statsMap);

        toast.success('Dashboard and quiz data loaded successfully');
      } catch (error: any) {
        console.error('Error fetching instructor dashboard:', error); // Debug log
        toast.error(error.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">No data available</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Instructor Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Total Quizzes Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{dashboardData.totalQuizzes ?? 'N/A'}</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Average Score Across Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {dashboardData.averageScoreAcrossQuizzes ? dashboardData.averageScoreAcrossQuizzes.toFixed(2) : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Average Attempts per Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {dashboardData.averageAttemptsPerQuiz ? dashboardData.averageAttemptsPerQuiz.toFixed(2) : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* All Quizzes with Statistics */}
      <Card className="bg-white shadow-sm"> 
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Quizzes</CardTitle>
          <Button
            variant={'grayscale'}
            onClick={() => router.push('/dashboard/instructor/quiz/create')}
          >
            Create Quiz
          </Button>
        </CardHeader>
        <CardContent>
          {quizzes.length === 0 ? (
            <p>No quizzes created</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Year of Study</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Total Attempts</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Highest Score</TableHead>
                    <TableHead>Lowest Score</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => {
                    const stats = quizStats[quiz.quizId];
                    return (
                      <TableRow key={quiz.quizId}>
                        <TableCell>{quiz.title}</TableCell>
                        <TableCell>{quiz.yearOfStudy}</TableCell>
                        <TableCell>{getQuizStatus(quiz.startTime, quiz.endTime)}</TableCell>
                        <TableCell>{formatISTDate(quiz.startTime)}</TableCell>
                        <TableCell>{formatISTDate(quiz.endTime)}</TableCell>
                        <TableCell>{stats?.totalAttempts ?? quiz.totalAttempts ?? 0}</TableCell>
                        <TableCell>{stats?.averageScore ? stats.averageScore.toFixed(2) : 'N/A'}</TableCell>
                        <TableCell>{stats?.highestScore ?? 'N/A'}</TableCell>
                        <TableCell>{stats?.lowestScore ?? 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            variant={'grayscale'}
                            size="sm"
                            onClick={() => router.push(`/dashboard/instructor/quiz/${quiz.quizId}/resultsForInstructor?name=${encodeURIComponent(quiz.title)}`)}
                          >
                            View Results
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>)}
          </CardContent>
      </Card>
    </div>
  );
}