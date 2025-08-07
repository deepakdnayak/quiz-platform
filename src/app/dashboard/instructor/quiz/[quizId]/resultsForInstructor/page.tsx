'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { getQuizResultsForInstructor } from '@/lib/api';
import { QuizResultForInstructor } from '@/lib/types';

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

// Utility to export results to CSV
const exportToCSV = (results: QuizResultForInstructor[], quizTitle: string) => {
  const headers = ['USN', 'Student Name', 'Score', 'Year of Study', 'Roll Number', 'Attempt Date'];
  const rows = results.map((result) => [
    result.usn,
    result.studentName,
    result.score,
    result.yearOfStudy,
    result.rollNumber,
    formatISTDate(result.attemptDate),
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${quizTitle}_results.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function QuizResultsPage() {
  const [results, setResults] = useState<QuizResultForInstructor[]>([]);
  // const [quizTitle, setQuizTitle] = useState<string>('Quiz Results');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const searchParams = useSearchParams();
  const quizTitle = searchParams.get('name') as string  ;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to access quiz results');
      router.push('/auth/login');
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await getQuizResultsForInstructor(quizId);
        console.log('Quiz Results API Response:', response); // Debug log
        setResults(response);
        // // Fetch quiz title (optional, could be passed from dashboard or via API)
        // setQuizTitle(`Quiz ${quizId}`); // Replace with actual quiz title if available
        toast.success('Quiz results loaded successfully');
      } catch (error: any) {
        console.error('Error fetching quiz results:', error); // Debug log
        toast.error(error.message || 'Failed to load quiz results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [router, quizId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{quizTitle}</CardTitle>
          <Button
            className="bg-primary hover:bg-blue-700"
            onClick={() => exportToCSV(results, quizTitle)}
            disabled={results.length === 0}
          >
            Export Results
          </Button>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p>No results available</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>USN</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Year of Study</TableHead>
                    <TableHead>Attempt Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={result.usn || `result-${index}`}>
                      <TableCell>{result.usn}</TableCell>
                      <TableCell>{result.studentName}</TableCell>
                      <TableCell>{result.score}</TableCell>
                      <TableCell>{result.yearOfStudy}</TableCell>
                      <TableCell>{formatISTDate(result.attemptDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}