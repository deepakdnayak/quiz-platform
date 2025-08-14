'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google'; // Import Google OAuth components
import { jwtDecode } from 'jwt-decode'; // To decode the Google ID tokenimport { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { register, login } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: role selection, Step 2: form

  // 🔒 Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const getUser = (role: string) => {
    switch (role) {
      case 'Student':
        return 'student';
      case 'Instructor':
        return 'instructor';
      case 'Admin':
        return 'admin';
    }
  };

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register({ email, password, role });
      const response = await login({ email, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success('Registered successfully');
      router.push(`/dashboard/${getUser(response.user.role)}`);
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

  interface DecodedGoogleJWT {
    email: string;
    name: string;
    sub: string; // Google ID
  }

  // Handle Google login success
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse): Promise<void> => {
    if (!credentialResponse.credential) {
      toast.error('Google login failed: No credentials received');
      return;
    }
    setIsLoading(true);
    try {
      const decoded = jwtDecode<DecodedGoogleJWT>(credentialResponse.credential);
      const { email, sub: googleId } = decoded;

      // Simulate a login API call (replace with your actual backend integration)
      console.log(email,googleId);

      await register({ email, password: googleId, role }); // Adjust based on your backend
      const response = await login({ email, password: googleId }); 
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success('Logged in with Google successfully');
      router.push(`/dashboard/${getUser(response.user.role)}`);
      router.push(`/`);
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Failed to log in with Google');
      toast.error("User not found!! Please register before login");
      router.push(`/`);
    }
    finally {
      setIsLoading(false);
    }
  };

  // Handle Google login failure
  const handleGoogleFailure = (error: unknown) => {
    toast.error('Google login failed. Please try again.');
    console.error(error);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-70px)] bg-background">
      {step === 1 ? (
        <Card className="w-full max-w-md shadow-xl mx-2 md:mx-auto">
          <CardHeader className="text-center space-y-1 pb-2">
            <CardTitle className="text-2xl font-bold tracking-tight">Choose Account Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="grayscale" className="w-full" onClick={() => handleRoleSelect('Student')}>
              Register as Student
            </Button>
            <Button variant="grayscale" className="w-full" onClick={() => handleRoleSelect('Instructor')}>
              Register as Instructor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md shadow-xl mx-2 md:mx-auto">
          <CardHeader className="text-center space-y-1 pb-2">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Register as {role}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {/* Google Login Button */}
              <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={()=> handleGoogleFailure}
                  useOneTap={true} // Optional: Enables Google One Tap
                  shape="rectangular"
                  size="large"
                  text="signin_with"
                  theme="filled_blue"
                  width="100%"
                />
              </GoogleOAuthProvider>

              <Button
                type="submit"
                className="w-full"
                variant={'grayscale'}
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </Button>
            </form>

            <p className="text-center text-sm mt-4">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
