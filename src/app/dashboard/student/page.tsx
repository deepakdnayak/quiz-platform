'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { getStudentDashboard } from '@/lib/api';
import { StudentDashboard } from '@/lib/types';

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboard | null>(null);
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
        const response = await getStudentDashboard();
        console.log('Student Dashboard API Response:', response); // Debug log
        setData(response);
        toast.success('Dashboard loaded successfully');
      } catch (error: any) {
        console.error('Error fetching student dashboard:', error); // Debug log
        toast.error(error.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">Loading...</div>;
  }

  if (!data) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">No data available</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Student Dashboard</h1>
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
                    {data.upcomingQuizzes?.map((quiz,index) => (
                      <TableRow key={quiz.id ?? `quiz-${index}`}>
                        <TableCell>{quiz.title}</TableCell>
                        <TableCell>{quiz.startTime}</TableCell>
                        <TableCell>{quiz.endTime}</TableCell>
                        
                      </TableRow>
                    )) ?? <TableRow><TableCell colSpan={4}>No quizzes available</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
                    {data.activeQuizzes?.map((quiz,index) => (
                      <TableRow key={quiz.id ?? `quiz-${index}`}>
                        <TableCell>{quiz.title}</TableCell>
                        <TableCell>{quiz.startTime}</TableCell>
                        <TableCell>{quiz.endTime}</TableCell>
                        <TableCell>
                          <Button className="bg-primary hover:bg-blue-700" onClick={() => router.push(`/quiz/${quiz.id}`)} disabled={!quiz.id}>
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
                    <TableHead>Date</TableHead>
                    <TableHead>Results</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.completedQuizzes?.map((quiz, index) => (
                    <TableRow key={quiz.quizId ?? `quiz-${index}`}>
                      <TableCell>{quiz.title}</TableCell>
                      <TableCell>{quiz.totalScore}</TableCell>
                      <TableCell>{quiz.attemptDate}</TableCell>
                      <TableCell>
                        <Button
                          className="bg-primary hover:bg-blue-700"
                          onClick={() => router.push(`/quiz/${quiz.quizId}/results`)}
                          disabled={!quiz.quizId}
                        >
                          View Results
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) ?? <TableRow><TableCell colSpan={4}>No quizzes available</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}