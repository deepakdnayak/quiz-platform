'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import DateTimePicker from 'react-datetime-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { updateQuiz, getQuizDetailsForEdit } from '@/lib/api';
import { UpdateQuizForm } from '@/lib/types';
import 'react-datetime-picker/dist/DateTimePicker.css';
import { Control, UseFormRegister, FieldErrors } from 'react-hook-form';

// Custom CSS to fix DateTimePicker transparency and styling
const customStyles = `
  .react-datetime-picker__wrapper {
    border: 1px solid #d1d5db !important;
    border-radius: 0.375rem;
    padding: 0.5rem;
    background-color: white;
  }
  .react-datetime-picker__calendar {
    background-color: white;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    z-index: 50;
  }
  .react-datetime-picker__calendar--open {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .react-datetime-picker__inputGroup__input {
    color: #1f2937;
  }
`;

// Component for each question (unchanged)
function QuestionField({
  control,
  register,
  errors,
  qIndex,
  removeQuestion,
  questionsLength,
}: {
  control: Control<UpdateQuizForm>;
  register: UseFormRegister<UpdateQuizForm>;
  errors: FieldErrors<UpdateQuizForm>;
  qIndex: number;
  removeQuestion: (index: number) => void;
  questionsLength: number;
}) {
  const { fields: options, append: appendOption, remove: removeOption } = useFieldArray<
    UpdateQuizForm,
    `questions.${number}.options`
  >({
    control,
    name: `questions.${qIndex}.options`,
  });

  return (
    <Card className="p-6 bg-white shadow-sm">
      <div className="space-y-4">
        <div>
          <Label htmlFor={`questions.${qIndex}.text`} className="text-lg font-medium">
            Question {qIndex + 1}
          </Label>
          <Textarea
            id={`questions.${qIndex}.text`}
            {...register(`questions.${qIndex}.text`, { required: 'Question text is required' })}
            placeholder="Enter question text"
            className="mt-2 h-24"
          />
          {errors.questions?.[qIndex]?.text && (
            <p className="text-red-500 text-sm mt-1">{errors.questions[qIndex].text.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor={`questions.${qIndex}.score`} className="text-lg font-medium">
            Score
          </Label>
          <Input
            id={`questions.${qIndex}.score`}
            type="number"
            {...register(`questions.${qIndex}.score`, {
              required: 'Score is required',
              min: { value: 1, message: 'Score must be at least 1' },
            })}
            placeholder="Enter score"
            className="mt-2 w-24"
          />
          {errors.questions?.[qIndex]?.score && (
            <p className="text-red-500 text-sm mt-1">{errors.questions[qIndex].score.message}</p>
          )}
        </div>
        <div>
          <Label className="text-lg font-medium">Options</Label>
          <div className="space-y-3 mt-2">
            {options.map((option, oIndex) => (
              <div key={option.id} className="flex items-center space-x-3">
                <Controller
                  control={control}
                  name={`questions.${qIndex}.options.${oIndex}.isCorrect`}
                  render={({ field }) => (
                    <Checkbox
                      checked={!!field.value} // Ensure truthy values check the box
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                      id={`questions.${qIndex}.options.${oIndex}.isCorrect`}
                      className="h-5 w-5"
                    />
                  )}
                />
                <Input
                  {...register(`questions.${qIndex}.options.${oIndex}.text`, {
                    required: 'Option text is required',
                  })}
                  placeholder={`Option ${oIndex + 1}`}
                  className="flex-1"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeOption(oIndex)}
                  disabled={options.length <= 2}
                >
                  Remove
                </Button>
              </div>
            ))}
            {errors.questions?.[qIndex]?.options && (
              <p className="text-red-500 text-sm mt-1">All options must have text</p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => appendOption({ text: '', isCorrect: false })}
              className="mt-2"
            >
              Add Option
            </Button>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => removeQuestion(qIndex)}
          disabled={questionsLength === 1}
        >
          Remove Question
        </Button>
      </div>
    </Card>
  );
}

export default function EditQuizPage() {
  const router = useRouter();
  const { quizId } = useParams();
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<UpdateQuizForm | null>(null);

  const { register, control, handleSubmit, formState: { errors }, reset } = useForm<UpdateQuizForm>({
    defaultValues: {
      title: '',
      description: '',
      yearOfStudy: 1,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      duration: 30,
      questions: [{ text: '', score: 1, options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] }],
    },
  });

  const { fields: questions, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: 'questions',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const data = await getQuizDetailsForEdit(quizId as string);
        // Transform data to match UpdateQuizForm type
        const transformedData: UpdateQuizForm = {
          title: data.title || '',
          description: data.description || '',
          yearOfStudy: data.yearOfStudy || 1,
          startTime: data.startTime ? new Date(data.startTime).toISOString() : new Date().toISOString(),
          endTime: data.endTime ? new Date(data.endTime).toISOString() : new Date(Date.now() + 3600000).toISOString(),
          duration: data.duration || 30,
          questions: Array.isArray(data.questions)
            ? data.questions.map((q: any) => ({
                questionId: q.questionId || '',
                text: q.text || '',
                score: q.score || 1,
                options: Array.isArray(q.options)
                  ? q.options.map((o: any) => ({
                      optionId: o.optionId || '',
                      text: o.text || '',
                      isCorrect: o.isCorrect, // Directly use the provided isCorrect
                    }))
                  : [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
              }))
            : [{ text: '', score: 1, options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] }],
        };
        setQuizData(transformedData);
        reset(transformedData);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message || 'Failed to load quiz data');
        } else {
          toast.error('An unknown error occurred');
        }
        router.push('/dashboard/instructor');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizData();
    }
  }, [quizId, router, reset]);

  const onSubmit = async (data: UpdateQuizForm) => {
    try {
      setSubmitting(true);
      // Validate dates
      const start = new Date(data.startTime!);
      const end = new Date(data.endTime!);
      if (start >= end) {
        toast.error('End time must be after start time');
        return;
      }
      // Validate questions
      for (const question of data.questions!) {
        if (question.options.length < 2) {
          toast.error('Each question must have at least two options');
          return;
        }
        if (!question.options.some((option) => option.isCorrect === true)) {
          toast.error('Each question must have at least one correct option');
          return;
        }
      }
      await updateQuiz(quizId as string, data);
      toast.success('Quiz updated successfully');
      router.push('/dashboard/instructor');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to update quiz');
      } else {
        toast.error('An unknown error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!quizData) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <style>{customStyles}</style>
      <Card className="w-full max-w-4xl bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Edit Quiz: {quizData.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Quiz Details Section */}
            <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800">Quiz Details</h3>
              <div className="grid gap-6">
                <div>
                  <Label htmlFor="title" className="text-lg font-medium">
                    Title
                  </Label>
                  <Input
                    id="title"
                    {...register('title', { required: 'Title is required' })}
                    placeholder="Enter quiz title"
                    className="mt-2 h-10"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <Label htmlFor="description" className="text-lg font-medium">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Enter quiz description"
                    className="mt-2 h-24"
                  />
                </div>
                <div>
                  <Label htmlFor="yearOfStudy" className="text-lg font-medium">
                    Year of Study
                  </Label>
                  <Controller
                    name="yearOfStudy"
                    control={control}
                    rules={{ required: 'Year of study is required' }}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <SelectTrigger className="mt-2 h-10">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4].map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              Year {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.yearOfStudy && <p className="text-red-500 text-sm mt-1">{errors.yearOfStudy.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="startTime" className="text-lg font-medium">
                      Start Time
                    </Label>
                    <Controller
                      name="startTime"
                      control={control}
                      rules={{ required: 'Start time is required' }}
                      render={({ field }) => (
                        <DateTimePicker
                          onChange={(value) => field.onChange(value?.toISOString())}
                          value={field.value ? new Date(field.value) : null}
                          disableClock
                          className="mt-2 w-full"
                        />
                      )}
                    />
                    {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="endTime" className="text-lg font-medium">
                      End Time
                    </Label>
                    <Controller
                      name="endTime"
                      control={control}
                      rules={{ required: 'End time is required' }}
                      render={({ field }) => (
                        <DateTimePicker
                          onChange={(value) => field.onChange(value?.toISOString())}
                          value={field.value ? new Date(field.value) : null}
                          disableClock
                          className="mt-2 w-full"
                        />
                      )}
                    />
                    {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="duration" className="text-lg font-medium">
                    Duration (minutes)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    {...register('duration', {
                      required: 'Duration is required',
                      min: { value: 1, message: 'Duration must be at least 1 minute' },
                    })}
                    placeholder="Enter duration"
                    className="mt-2 h-10 w-32 sm:w-40"
                  />
                  {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>}
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800">Questions</h3>
              {questions.map((question, qIndex) => (
                <QuestionField
                  key={question.id}
                  control={control}
                  register={register}
                  errors={errors}
                  qIndex={qIndex}
                  removeQuestion={removeQuestion}
                  questionsLength={questions.length}
                />
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  appendQuestion({
                    text: '',
                    score: 1,
                    options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
                  })
                }
                className="w-full sm:w-auto"
              >
                Add Question
              </Button>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                variant={'grayscale'}
                onClick={() => router.push('/dashboard/instructor')}
                disabled={submitting}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={'grayscale'}
                className="px-6"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Update Quiz'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}