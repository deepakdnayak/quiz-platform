'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { login, sendResetOTP, verifyResetOTP, resetPassword } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password states
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: Enter new password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await login({ email, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success('Logged in successfully');
      router.push('/');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else if (typeof error === 'string') {
        toast.error(error);
      } else {
        toast.error('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setForgotLoading(true);
    try {
      await sendResetOTP({ email: forgotEmail });
      toast.success('OTP sent to your email');
      setForgotStep(2);
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Failed to send OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setForgotLoading(true);
    try {
      await verifyResetOTP({ email: forgotEmail, otp });
      toast.success('OTP verified');
      setForgotStep(3);
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Invalid OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setForgotLoading(true);
    try {
      await resetPassword({ email: forgotEmail, newPassword });
      toast.success('Password reset successful. Please log in.');
      setForgotOpen(false);
      setForgotStep(1);
      setForgotEmail('');
      setOtp('');
      setNewPassword('');
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-70px)] bg-background">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-1 pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" variant="grayscale" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <p className="text-center text-sm mt-4">
            Don’t have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
          <p className="text-center text-sm mt-2">
            <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
              <DialogTrigger asChild>
                <Button variant="link" className="p-0 text-primary hover:underline">
                  Forgot Password?
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle>Forgot Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {forgotStep === 1 && (
                    <>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                      <Button variant="grayscale" onClick={handleSendOTP} disabled={forgotLoading} className="w-full">
                        {forgotLoading ? 'Sending...' : 'Send OTP'}
                      </Button>
                    </>
                  )}
                  {forgotStep === 2 && (
                    <>
                      <Input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                      <Button variant="grayscale" onClick={handleVerifyOTP} disabled={forgotLoading} className="w-full">
                        {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                      </Button>
                    </>
                  )}
                  {forgotStep === 3 && (
                    <>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <Button variant="grayscale" onClick={handleResetPassword} disabled={forgotLoading} className="w-full">
                        {forgotLoading ? 'Resetting...' : 'Reset Password'}
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}