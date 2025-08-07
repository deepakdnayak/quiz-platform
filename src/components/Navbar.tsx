'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Navbar() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    else {
      setUser(null); // Clear user if no token or storedUser
    }
  }, [pathname]); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  return (
    <nav className="bg-gray-100 shadow p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          Quiz Platform
        </Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Link href={`/dashboard/${user.role.toLowerCase()}`}>
                <Button variant={'grayscale'}>Dashboard</Button>
              </Link>
              <Button variant={'outline'} className="hover:bg-gray-300 hover:text-white hover:border-1 hover:border-gray-400" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant={'grayscale'}>Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant={'outline'} className="hover:bg-gray-300 hover:text-white hover:border-1 hover:border-gray-400">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}