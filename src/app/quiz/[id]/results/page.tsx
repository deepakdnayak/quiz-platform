'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { getQuizResults } from '@/lib/api';
import { QuizResults } from '@/lib/types';

export default function QuizResultsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token:', token ? 'Present' : 'Missing'); // Debug log
    if (!token) {
      toast.error('Please log in to view results');
      router.push('/auth/login');
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await getQuizResults(id as string);
        console.log('Quiz Results API Response:', response); // Debug log
        setResults(response);
      } catch (error: any) {
        console.error('Error fetching quiz results:', error);
        toast.error(error.message || 'Failed to load results');
        router.push('/dashboard/student');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">Loading...</div>;
  }

  if (!results || !results.quiz || !results.attempt) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">Results not found</div>;
  }

  // Calculate total possible score
  const totalPossibleScore = results.quiz.questions.reduce((sum, q) => sum + q.score, 0);

  // Helper to get option text by optionId
  const getOptionText = (questionId: string, optionId: string) => {
    const question = results.quiz.questions.find((q) => q.questionId === questionId);
    if (!question) return 'Unknown';
    const option = question.options.find((opt) => opt.optionId === optionId);
    return option ? option.text : 'Unknown';
  };

  return (
    <div className="container mx-auto py-8 min-h-[calc(100vh-64px)]">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Quiz Results</CardTitle>
          <p className="text-gray-600">
            Score: {results.attempt.totalScore} / {totalPossibleScore}
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Your Answer(s)</TableHead>
                <TableHead>Correct Answer(s)</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.quiz.questions.map((question) => {
                const answer = results.attempt.answers.find(
                  (a) => a.questionId === question.questionId
                );
                return (
                  <TableRow key={question.questionId}>
                    <TableCell>{question.text}</TableCell>
                    <TableCell>
                      {answer && answer.selectedOptionIds.length > 0
                        ? answer.selectedOptionIds
                            .map((optId) => getOptionText(question.questionId, optId))
                            .join(', ')
                        : 'Not answered'}
                    </TableCell>
                    <TableCell>
                      {question.correctOptionIds
                        .map((optId) => getOptionText(question.questionId, optId))
                        .join(', ')}
                    </TableCell>
                    <TableCell>
                      {answer ? `${answer.scoreAwarded}/${question.score}` : `0/${question.score}`}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => router.push('/dashboard/student')}
              className="bg-primary hover:bg-blue-700"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}