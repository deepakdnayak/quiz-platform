'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Users, UserCheck, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Home', icon: Home, path: '/dashboard/admin/home' },
    { name: 'Instructors', icon: Users, path: '/dashboard/admin/instructors' },
    { name: 'Students', icon: UserCheck, path: '/dashboard/admin/students' },
    { name: 'Instructor Approval', icon: UserPlus, path: '/dashboard/admin/approval' },
  ];

  return (
    <div className={cn('flex', className)}>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold text-primary">Admin Dashboard</h2>
        </div>
        <nav className="mt-4">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                'w-full justify-start px-4 py-2 text-left',
                pathname === item.path ? 'bg-blue-100 text-primary' : 'text-gray-600 hover:bg-gray-100'
              )}
              onClick={() => {
                router.push(item.path);
                setIsOpen(false);
              }}
            >
              <item.icon className="mr-2 h-5 w-5" />
              {item.name}
            </Button>
          ))}
        </nav>
      </aside>
      <Button
        variant="outline"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Close' : 'Menu'}
      </Button>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}