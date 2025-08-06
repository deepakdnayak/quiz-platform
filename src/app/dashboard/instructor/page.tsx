'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { getInstructorDashboard } from '@/lib/api';
import { InstructorDashboard } from '@/lib/types';


export default function InstructorDashboardPage() {
  const [data, setData] = useState<InstructorDashboard | null>(null);
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
        const response = await getInstructorDashboard();
        console.log('Instructor Dashboard API Response:', response); // Debug log
        setData(response);
        toast.success('Dashboard loaded successfully');
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
    return <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">Loading...</div>;
  }

  if (!data) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">No data available</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Instructor Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quizzes Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data.totalQuizzes ?? 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data.averageScoreAcrossQuizzes ?? 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data.averageAttemptsPerQuiz ?? 'N/A'}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          {data.activeQuizzes?.length === 0 ? (
            <p>No quizzes created</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Completions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.activeQuizzes?.map((quiz,index) => (
                    <TableRow key={quiz.id ?? `quiz-${index}`}>
                      <TableCell>{quiz.title}</TableCell>
                      <TableCell>{quiz.description}</TableCell>
                      <TableCell>{quiz.completions ?? 0}</TableCell>
                    </TableRow>
                  )) ?? <TableRow><TableCell colSpan={3}>No quizzes available</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="py-5 flex justify-end">
        <Button
            className="bg-primary hover:bg-blue-700"
            onClick={() => router.push('/dashboard/instructor/quiz/create')}
          >
            Create Quiz
        </Button>
      </div>

    </div>
  );
}