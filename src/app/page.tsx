'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Award } from 'lucide-react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { getStatistics } from '@/lib/api';
import { Stats } from '@/lib/types';
import { toast } from 'sonner';

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    totalQuizzes: 0,
    totalStudents: 0,
    totalInstructors: 0,
  });
  // const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const router = useRouter();
  // const pathname = usePathname();

  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   const storedUser = localStorage.getItem('user');
  //   if (token && storedUser) {
  //     setUser(JSON.parse(storedUser));
  //   }
  //   else {
  //     setUser(null); // Clear user if no token or storedUser
  //   }
  // }, [pathname]); 

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStatistics();
        setStats(data.stats);
        setLoading(false);
      }
      catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message || 'Failed to load statistics');
        } else if (typeof error === 'string') {
          toast.error(error || 'Failed to load statistics');
        } else {
          toast.error('An unknown error occurred');
        }
        setStats({
          totalQuizzes: 0,
          totalStudents: 0,
          totalInstructors: 0,
        });
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Ripple effect handler
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const button = buttonRef.current;
    const ripple = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - radius;
    const y = e.clientY - rect.top - radius;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      toast.success('Welcome Back');
      router.push(`/dashboard/${parsedUser.role.toLowerCase()}`);
    }
  }, [router]);

  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Master Your Knowledge with Quiz Platform
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Create, take, and track quizzes effortlessly. Join thousands of students and instructors in a dynamic learning experience!
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/register">
              <Button
                variant="default"
                onClick={handleClick}
                className="relative bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-md overflow-hidden text-lg"
              >
                Sign Up
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="relative border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-6 rounded-md text-lg"
                onClick={handleClick}
              >
                Log In
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Platform Details Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Why Choose Quiz Platform?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <BookOpen className="w-12 h-12 text-blue-600 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Take Quizzes</h3>
            <p className="text-gray-600">
              Access quizzes tailored to your year of study. Attempt them within the allotted time, submit answers, and view results once the quiz ends.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Users className="w-12 h-12 text-blue-600 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Create Content</h3>
            <p className="text-gray-600">
              Instructors can design engaging quizzes with custom questions, set time limits, and track student performance with detailed statistics.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Award className="w-12 h-12 text-blue-600 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Students and instructors can monitor progress with real-time analytics, including scores, completion rates, and year-wise performance.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section ref={ref} className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Our Platform by the Numbers
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-4xl font-bold text-blue-600">
                {loading || !inView ? (
                  '0'
                ) : (
                  <CountUp end={stats.totalQuizzes} duration={2.5} />
                )}
              </h3>
              <p className="text-gray-600 mt-2">Quizzes Conducted</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-4xl font-bold text-blue-600">
                {loading || !inView ? (
                  '0'
                ) : (
                  <CountUp end={stats.totalStudents} duration={2.5} />
                )}
              </h3>
              <p className="text-gray-600 mt-2">Students Engaged</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-4xl font-bold text-blue-600">
                {loading || !inView ? (
                  '0'
                ) : (
                  <CountUp end={stats.totalInstructors} duration={2.5} />
                )}
              </h3>
              <p className="text-gray-600 mt-2">Instructors Onboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Quiz Platform</h3>
              <p className="text-gray-400">
                Empowering learning through interactive quizzes and analytics.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/auth/register" className="hover:text-blue-400">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-blue-400">
                    Log In
                  </Link>
                </li>
                <li>
                  <Link href="/quizzes" className="hover:text-blue-400">
                    Explore Quizzes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p className="text-gray-400">
                Email: support@quizplatform.com
                <br />
                Phone: +1-800-QUIZ-FUN
              </p>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            &copy; {new Date().getFullYear()} Quiz Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}