import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-4xl font-bold text-primary mb-4">Welcome to Quiz Platform</h1>
      <p className="text-lg text-secondary mb-6">Take quizzes, create content, or manage users!</p>
      <Link href="/auth/register">
        <Button variant={'grayscale'}>Get Started</Button>
      </Link>
    </div>
  );
}