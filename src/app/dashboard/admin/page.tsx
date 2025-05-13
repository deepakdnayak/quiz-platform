'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { getAdminDashboard } from '@/lib/api';
import { AdminDashboard } from '@/lib/types';

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
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
        const response = await getAdminDashboard();
        console.log('Admin Dashboard API Response:', response); // Debug log
        setData(response);
        toast.success('Dashboard loaded successfully');
      } catch (error: any) {
        console.error('Error fetching admin dashboard:', error); // Debug log
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
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data.stats?.userCount ?? 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data.stats?.quizCount ?? 'N/A'}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {data.users?.length === 0 ? (
            <p>No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                    </TableRow>
                  )) ?? <TableRow><TableCell colSpan={2}>No users available</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}