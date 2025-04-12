'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import Link from 'next/link';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    // This is where you would typically make an API call to register the user
    // For this example, we'll simulate a successful registration
    try {
      // Example API call (replace with actual implementation)
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password }),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Registration failed');
      // }

      // Simulate a successful registration
      setTimeout(() => {
        setSuccessMessage('Account created successfully! You can now sign in.');
        setIsLoading(false);
        // Redirect to sign in page after 2 seconds
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      }, 1500);
      
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setIsLoading(true);
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-base-200">
      <div className="w-full max-w-md space-y-8 bg-base-100 p-8 shadow-lg rounded-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="space-y-4">
            <button
              type="button"
              className="btn btn-outline w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              <Icon icon="flat-color-icons:google" width="20" height="20" />
              <span>Sign up with Google</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-base-100 px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

        
          </div>

        {error && (
          <div className="alert alert-error">
            <Icon icon="mdi:close-circle" className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="alert alert-success">
            <Icon icon="mdi:check-circle" className="h-5 w-5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full input input-bordered"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full input input-bordered"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full input input-bordered"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full input input-bordered"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input type="checkbox" required className="checkbox checkbox-xs checkbox-primary" />
              <span className="ml-2 text-sm">
                I agree to the{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>
          <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <Icon icon="mdi:account-plus" />
                  <span>Create account</span>
                </>
              )}
            </button>
        
        </form>
      </div>
    </div>
  );
}