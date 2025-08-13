'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import { getAdminStatistics, deleteUser, updateUserRole, approveUser, getUserProgress, getNotifications } from '@/lib/api';
import { AdminStatistics, UserProgress, Notification } from '@/lib/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [progress, setProgress] = useState<{ [userId: string]: UserProgress | null }>({});
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState<string>(''); // New state for year filter
  const router = useRouter();
  const { section } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to access the dashboard');
      router.push('/auth/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [statsResponse, notificationsResponse] = await Promise.all([
          getAdminStatistics(),
          getNotifications(),
        ]);
        setStats(statsResponse);
        setNotifications(notificationsResponse);
        toast.success('Dashboard loaded successfully');
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else if (typeof error === 'string') {
          toast.error(error);
        } else {
          toast.error('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      setStats((prev) => prev && ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
        studentDetails: prev.studentDetails.filter((user) => user.id !== userId),
        instructorDetails: prev.instructorDetails.filter((user) => user.id !== userId),
        studentCount: prev.studentDetails.some((user) => user.id === userId) ? prev.studentCount - 1 : prev.studentCount,
        instructorCount: prev.instructorDetails.some((user) => user.id === userId) ? prev.instructorCount - 1 : prev.instructorCount,
      }));
      setNotifications(notifications.filter((notif) => notif.userId !== userId));
      toast.success('User deleted successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else if (typeof error === 'string') {
        toast.error(error);
      } else {
        toast.error('An unknown error occurred');
      }
    }
  };

  const handleRoleChange = async (userId: string, role: 'Student' | 'Instructor' | 'Admin') => {
    try {
      await updateUserRole(userId, role);
      setStats((prev) => prev && ({
        ...prev,
        studentDetails: prev.studentDetails.map((user) =>
          user.id === userId && role !== 'Student' ? null : user
        ).filter((user): user is NonNullable<typeof user> => !!user),
        instructorDetails: prev.instructorDetails.map((user) =>
          user.id === userId && role !== 'Instructor' ? null : user
        ).filter((user): user is NonNullable<typeof user> => !!user),
        studentCount: prev.studentDetails.some((user) => user.id === userId) && role !== 'Student' ? prev.studentCount - 1 : prev.studentCount,
        instructorCount: prev.instructorDetails.some((user) => user.id === userId) && role !== 'Instructor' ? prev.instructorCount - 1 : prev.instructorCount,
      }));
      if (role === 'Instructor') {
        setStats((prev) => prev && ({
          ...prev,
          instructorDetails: [...prev.instructorDetails, { id: userId, email: prev.studentDetails.find((u) => u.id === userId)?.email || '', status: 'pending' }],
          instructorCount: prev.instructorCount + 1,
        }));
      }
      toast.success('User role updated');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to load dashboard');
      } else if (typeof error === 'string') {
        toast.error(error || 'Failed to load dashboard');
      } else {
        toast.error('An unknown error occurred');
      }
    }
  };

  const handleApprove = async (userId: string, approval: boolean) => {
  try {
    await approveUser(userId, approval); // Pass true or false to backend

    setStats((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        instructorDetails: approval
          ? // Original logic: approve instructor
            prev.instructorDetails.map((user) =>
              user.id === userId ? { ...user, status: 'approved' } : user
            )
          : // New logic: remove approval immediately from list
            prev.instructorDetails.map((user) =>
              user.id === userId ? { ...user, status: 'pending' } : user
            ),
      };
    });

    if (approval) {
      // If approving, also remove from notifications
      setNotifications((prev) =>
        prev.filter((notif) => notif.userId !== userId)
      );
      toast.success('User approved as instructor');
    } else {
      toast.error('User approval removed');
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message || 'Failed to load dashboard');
    } else if (typeof error === 'string') {
      toast.error(error || 'Failed to load dashboard');
    } else {
      toast.error('An unknown error occurred');
    }
  }
};


  // const handleViewProgress = async (user: { id: string; email: string }) => {
  //   if (progress[user.id]) {
  //     setProgress({ ...progress, [user.id]: null });
  //     setSelectedUser(null);
  //     return;
  //   }
  //   try {
  //     const userProgress = await getUserProgress(user.id);
  //     setProgress({ ...progress, [user.id]: userProgress });
  //     setSelectedUser(user);
  //     toast.success('User progress loaded');
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       toast.error(error.message);
  //     } else if (typeof error === 'string') {
  //       toast.error(error);
  //     } else {
  //       toast.error('An unknown error occurred');
  //     }
  //   }
  // };

  // const handleViewDetails = async (user: { id: string; email: string }) => {
  //   if (progress[user.id]) {
  //     setProgress({ ...progress, [user.id]: null });
  //     setSelectedUser(null);
  //     return;
  //   }
  //   try {
  //     const userProgress = await getUserProgress(user.id);
  //     setProgress({ ...progress, [user.id]: userProgress });
  //     setSelectedUser(user);
  //     console.log(progress);
  //     toast.success('Student details loaded');
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       toast.error(error.message);
  //     } else if (typeof error === 'string') {
  //       toast.error(error);
  //     } else {
  //       toast.error('An unknown error occurred');
  //     }
  //   }
  // };

  interface Attempt {
  quizId: string;
  title: string;
  totalScore: number;
  attemptDate: string;
}

interface UserProgressResponse {
  student: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    yearOfStudy: number;
  };
  attempts: Attempt[];
  averageScore: number;
  totalQuizzesAttempted: number;
}

const handleViewDetails = async (user: { id: string; email: string }) => {
  if (progress[user.id]) {
    setProgress({ ...progress, [user.id]: null });
    setSelectedUser(null);
    return;
  }
  try {
    const userProgress: UserProgressResponse = await getUserProgress(user.id);

    const transformedProgress = {
      ...userProgress,
      quizzes: userProgress.attempts.map((a: Attempt) => ({
        id: a.quizId,
        title: a.title,
        score: a.totalScore * 100,
        completedAt: a.attemptDate
      }))
    };

    setProgress({ ...progress, [user.id]: transformedProgress });
    setSelectedUser(user);
    toast.success('Student details loaded');
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else if (typeof error === 'string') {
      toast.error(error);
    } else {
      toast.error('An unknown error occurred');
    }
  }
};


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.error('Please login to access dashboard');
    return router.push('/');
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Sidebar className="md:block" />
      <main className="flex-1 p-8 md:ml-64">
        {section === 'home' && (
          <>
            <h1 className="text-3xl font-bold text-primary mb-6">Home</h1>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{stats?.totalUsers ?? 'N/A'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{stats?.studentCount ?? 'N/A'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Instructors</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{stats?.instructorCount ?? 'N/A'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Admins</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{stats?.adminCount ?? 'N/A'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Quizzes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{stats?.totalQuizzes ?? 'N/A'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Completions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{stats?.totalCompletions ?? 'N/A'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Active Quizzes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{stats?.activeQuizzes ?? 'N/A'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{stats?.averageScore ? `${stats.averageScore.toFixed(1)}%` : 'N/A'}</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
        {section === 'instructors' && (
          <Card>
            <CardHeader>
              <CardTitle>Instructors</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.instructorDetails.filter((user) => user.status === 'approved').length === 0 ? (
                <p>No approved instructors found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats?.instructorDetails.filter((user) => user.status === 'approved').map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.status}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              onClick={() => handleApprove(user.id, false)}
                            >
                              Remove Approval
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {section === 'students' && (
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label htmlFor="yearFilter" className="mr-2">Filter by Year:</label>
                <select
                  id="yearFilter"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="border rounded p-2"
                >
                  <option value="">All Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
              {stats?.studentDetails.filter((user) => !filterYear || user.yearOfStudy === Number(filterYear)).length === 0 ? (
                <p>No students found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Year of Study</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats?.studentDetails.filter((user) => !filterYear || user.yearOfStudy === Number(filterYear)).map((user) => (
                        <TableRow
                          key={user.id}
                        >
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.yearOfStudy ?? 'N/A'}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(user.id);
                              }}
                              className="mr-2"
                            >
                              Delete
                            </Button>
                            <Button
                              variant="grayscale"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(user);
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Dialog open={!!selectedUser} onOpenChange={() => {
                    if (selectedUser) {
                      setProgress({ ...progress, [selectedUser.id]: null });
                      setSelectedUser(null);
                    }
                  }}>
                    {selectedUser && progress[selectedUser.id] && (
                    <DialogContent className="sm:max-w-lg bg-white">
                      <DialogHeader>
                        <DialogTitle>Details for {progress[selectedUser.id]?.student.firstName} {progress[selectedUser.id]?.student.lastName}</DialogTitle>
                      </DialogHeader>

                      <div className="mb-4 space-y-1">
                        <p><strong>Email:</strong> {progress[selectedUser.id]?.student.email}</p>
                        <p><strong>Year of Study:</strong> {progress[selectedUser.id]?.student.yearOfStudy}</p>
                        <p><strong>Average Score:</strong> {((progress[selectedUser.id]?.averageScore ?? 0) * 100).toFixed(2)}%</p>
                        <p><strong>Total Quizzes Attempted:</strong> {progress[selectedUser.id]?.totalQuizzesAttempted}</p>
                      </div>

                      {progress[selectedUser.id]?.quizzes?.length === 0 ? (
                        <p>No quizzes completed</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Quiz Title</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>Completed At</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {progress[selectedUser.id]?.quizzes?.map((quiz) => (
                              <TableRow key={quiz.id}>
                                <TableCell>{quiz.title}</TableCell>
                                <TableCell>{quiz.score}%</TableCell>
                                <TableCell>{new Date(quiz.completedAt).toLocaleDateString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </DialogContent>
                  )}

                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {section === 'approval' && (
          <Card>
            <CardHeader>
              <CardTitle>Instructor Approval</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p>No pending approval requests</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Requested Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.map((notif) => (
                        <TableRow key={notif.id}>
                          <TableCell>{notif.email}</TableCell>
                          <TableCell>{new Date(notif.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="grayscale"
                              className="mr-2"
                              onClick={() => handleApprove(notif.userId, true)}
                            >
                              Approve
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}