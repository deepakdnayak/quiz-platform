'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { createQuiz } from '@/lib/api';
import { CreateQuizForm } from '@/lib/types';
import 'react-datetime-picker/dist/DateTimePicker.css';

// Component for each question
function QuestionField({
  control,
  register,
  errors,
  qIndex,
  removeQuestion,
  questionsLength,
}: {
  control: any;
  register: any;
  errors: any;
  qIndex: number;
  removeQuestion: (index: number) => void;
  questionsLength: number;
}) {
  const { fields: options, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: `questions.${qIndex}.options`,
  });

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor={`questions.${qIndex}.text`}>Question {qIndex + 1}</Label>
          <Textarea
            id={`questions.${qIndex}.text`}
            {...register(`questions.${qIndex}.text`, { required: 'Question text is required' })}
            placeholder="Enter question text"
          />
          {errors.questions?.[qIndex]?.text && (
            <p className="text-red-500 text-sm">{errors.questions[qIndex].text.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor={`questions.${qIndex}.score`}>Score</Label>
          <Input
            id={`questions.${qIndex}.score`}
            type="number"
            {...register(`questions.${qIndex}.score`, {
              required: 'Score is required',
              min: { value: 1, message: 'Score must be at least 1' },
            })}
            placeholder="Enter score"
          />
          {errors.questions?.[qIndex]?.score && (
            <p className="text-red-500 text-sm">{errors.questions[qIndex].score.message}</p>
          )}
        </div>
        <div>
          <Label>Options</Label>
          <div className="space-y-2">
            {options.map((option: any, oIndex: number) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  {...register(`questions.${qIndex}.options.${oIndex}.isCorrect`)}
                />
                <Input
                  {...register(`questions.${qIndex}.options.${oIndex}.text`, {
                    required: 'Option text is required',
                  })}
                  placeholder={`Option ${oIndex + 1}`}
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
              <p className="text-red-500 text-sm">All options must have text</p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => appendOption({ text: '', isCorrect: false })}
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

export default function CreateQuizPage() {
  const router = useRouter();
  const { register, control, handleSubmit, formState: { errors } } = useForm<CreateQuizForm>({
    defaultValues: {
      title: '',
      description: '',
      yearOfStudy: 1,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
      duration: 30,
      questions: [{ text: '', score: 1, options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] }],
    },
  });

  const { fields: questions, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: 'questions',
  });

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data: CreateQuizForm) => {
    try {
      setSubmitting(true);
      // Validate dates
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      if (start >= end) {
        toast.error('End time must be after start time');
        return;
      }
      // Validate questions
      for (const question of data.questions) {
        if (question.options.length < 2) {
          toast.error('Each question must have at least two options');
          return;
        }
        if (!question.options.some((option) => option.isCorrect)) {
          toast.error('Each question must have at least one correct option');
          return;
        }
      }
      await createQuiz(data);
      toast.success('Quiz created successfully');
      router.push('/dashboard/instructor');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Create Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Quiz Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  placeholder="Enter quiz title"
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Enter quiz description (optional)"
                />
              </div>
              <div>
                <Label htmlFor="yearOfStudy">Year of Study</Label>
                <Controller
                  name="yearOfStudy"
                  control={control}
                  rules={{ required: 'Year of study is required' }}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value.toString()}
                    >
                      <SelectTrigger>
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
                {errors.yearOfStudy && <p className="text-red-500 text-sm">{errors.yearOfStudy.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Controller
                    name="startTime"
                    control={control}
                    rules={{ required: 'Start time is required' }}
                    render={({ field }) => (
                      <DateTimePicker
                        onChange={(value) => field.onChange(value?.toISOString())}
                        value={field.value ? new Date(field.value) : null}
                        disableClock
                        className="w-full"
                      />
                    )}
                  />
                  {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime.message}</p>}
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Controller
                    name="endTime"
                    control={control}
                    rules={{ required: 'End time is required' }}
                    render={({ field }) => (
                      <DateTimePicker
                        onChange={(value) => field.onChange(value?.toISOString())}
                        value={field.value ? new Date(field.value) : null}
                        disableClock
                        className="w-full"
                      />
                    )}
                  />
                  {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  {...register('duration', {
                    required: 'Duration is required',
                    min: { value: 1, message: 'Duration must be at least 1 minute' },
                  })}
                  placeholder="Enter duration"
                />
                {errors.duration && <p className="text-red-500 text-sm">{errors.duration.message}</p>}
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Questions</h3>
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
              >
                Add Question
              </Button>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/instructor')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-blue-700"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Quiz'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}