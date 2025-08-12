'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { getQuizDetails, submitQuizAttempt } from '@/lib/api';
import { QuizDetails, QuizAttempt } from '@/lib/types';

export default function AttemptQuizPage() {
  const router = useRouter();
  const { id } = useParams();
  const [quiz, setQuiz] = useState<QuizDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const { control, handleSubmit, formState: { errors }, setValue } = useForm<QuizAttempt>({
    defaultValues: {
      answers: [],
    },
  });

  // // Enter full-screen mode
  // const enterFullscreen = useCallback(() => {
  //   const elem = document.documentElement;
  //   if (elem.requestFullscreen) {
  //     elem.requestFullscreen().catch((err) => {
  //       console.error('Fullscreen failed:', err);
  //       toast.error('Fullscreen mode could not be enabled. Please enable it manually.');
  //     });
  //   }
  // }, []);

  // Block right-click, selection, and developer tools
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleSelectStart = (e: Event) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'F12') ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        toast.warning('Developer tools are disabled during the quiz.');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleKeyDown);

    // Apply CSS to disable selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    // Clean up event listeners
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, []);

  const handleViolation = () => {
    if (violationCount === 0) {
      setViolationCount(1);
      alert('This is your last warning! Switching tabs or closing the browser will end the test.');
    } else if (violationCount === 1) {
      submitQuizAutomatically();
    }
  };

  const submitQuizAutomatically = async () => {
    if (quiz) {
      const formData = {
        answers: quiz.questions.map((q) => ({
          questionId: q.questionId,
          selectedOptionIds: [],
        })),
      };
      try {
        setSubmitting(true);
        await submitQuizAttempt(id as string, formData);
        toast.success('Quiz submitted due to violation');
        router.push('/dashboard/student');
      } 
      catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message || 'Failed to submit quiz automatically');
        } else if (typeof error === 'string') {
          toast.error(error || 'Failed to submit quiz automatically');
        } else {
          toast.error('An unknown error occurred');
        }
        router.push('/dashboard/student');
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Handle tab switch or close
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation();
      }
    };
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (violationCount === 0) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
        handleViolation();
      } else if (violationCount === 1) {
        e.preventDefault();
        submitQuizAutomatically();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Clean up event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [violationCount, handleViolation, submitQuizAutomatically]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to attempt the quiz');
      router.push('/auth/login');
      return;
    }
    if (!id) {
      toast.error('Invalid quiz ID');
      router.push('/dashboard/student');
      return;
    }

    const fetchQuiz = async () => {
      try {
        const response = await getQuizDetails(id as string);
        const now = new Date();
        const start = new Date(response.startTime);
        const end = new Date(response.endTime);
        if (now < start) {
          toast.error('Quiz has not started yet');
          router.push('/dashboard/student');
          return;
        }
        if (now > end) {
          toast.error('Quiz has ended');
          router.push('/dashboard/student');
          return;
        }
        setQuiz(response);
        setValue('answers', response.questions.map((q) => ({
          questionId: q.questionId,
          selectedOptionIds: [],
        })));
        //enterFullscreen(); // Enter full-screen mode after quiz loads
      } 
      catch (error: unknown) {
        let errorMessage = 'Failed to load quiz';

        if (
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof (error as any).response === 'object'
        ) {
          const err = error as { response?: { status?: number; data?: { message?: string } } };

          if (err.response?.status === 404) {
            errorMessage = 'Quiz not found';
          } else if (err.response?.status === 401) {
            errorMessage = 'Unauthorized access. Please log in again.';
            localStorage.removeItem('token');
            router.push('/auth/login');
          } else if (err.response?.status === 403) {
            errorMessage = 'You do not have permission to access this quiz';
          } else {
            errorMessage = err.response?.data?.message || errorMessage;
          }
        }

        toast.error(errorMessage);
        router.push('/dashboard/student');
      }
      finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, router, setValue]);

  const onSubmit = async (data: QuizAttempt) => {
    if (!quiz || data.answers.length !== quiz.questions.length) {
      toast.error('Please answer all questions');
      return;
    }
    const unanswered = data.answers.some((answer) => answer.selectedOptionIds.length === 0);
    if (unanswered) {
      toast.error('Please select at least one option for each question');
      return;
    }

    setShowConfirm(true);
  };

  const confirmSubmission = async (data: QuizAttempt) => {
    try {
      setSubmitting(true);
      await submitQuizAttempt(id as string, data);
      toast.success('Quiz submitted successfully');
      router.push(`/quiz/${id}/results`);
    } 
    catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message || 'Failed to submit quiz');
        } else if (typeof error === 'string') {
          toast.error(error || 'Failed to submit quiz');
        } else {
          toast.error('An unknown error occurred');
        }
      }
    finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!quiz) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">Quiz not found</div>;
  }

  return (
    <div className="container mx-auto py-8 min-h-[calc(100vh-64px)]">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">{quiz.title}</CardTitle>
          <p className="text-gray-600">{quiz.description}</p>
          <p className="text-sm text-gray-500">
            Duration: {quiz.duration} minutes | Questions: {quiz.questions.length}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {quiz.questions.map((question, qIndex) => (
              <Card key={question.questionId} className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  {qIndex + 1}. {question.text}
                </h3>
                <Controller
                  name={`answers.${qIndex}.selectedOptionIds`}
                  control={control}
                  rules={{ validate: (value) => value.length > 0 || 'Please select at least one option' }}
                  render={({ field }) => (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div key={option.optionId} className="flex items-center space-x-2">
                          <Checkbox
                            id={option.optionId}
                            checked={field.value.includes(option.optionId)}
                            onCheckedChange={(checked) => {
                              const optionId = option.optionId;
                              const newValue = checked
                                ? [...field.value, optionId]
                                : field.value.filter((id: string) => id !== optionId);
                              field.onChange(newValue);
                            }}
                          />
                          <Label htmlFor={option.optionId}>{option.text}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                />
                {errors.answers?.[qIndex]?.selectedOptionIds && (
                  <p className="text-red-500 text-sm">{errors.answers[qIndex].selectedOptionIds.message}</p>
                )}
              </Card>
            ))}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="grayscale"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your quiz? You cannot change your answers after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit(confirmSubmission)}
              className="bg-primary hover:bg-blue-700"
            >
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}